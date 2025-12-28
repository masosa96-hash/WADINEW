import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "./chatStore";

export interface Document {
  id: string;
  filename: string;
  content: string;
  size: number;
  uploadedAt: string;
  tokens: number;
}

interface DocumentState {
  documents: Document[];
  currentDocumentId: string | null;

  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  setCurrentDocument: (id: string | null) => void;
  clearDocuments: () => void;

  uploadDocument: (file: File) => Promise<Document>;
  getDocumentContent: (id: string) => string | null;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocumentId: null,

      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc],
          currentDocumentId: doc.id,
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          currentDocumentId:
            state.currentDocumentId === id ? null : state.currentDocumentId,
        })),

      setCurrentDocument: (id) => set({ currentDocumentId: id }),

      clearDocuments: () => set({ documents: [], currentDocumentId: null }),

      getDocumentContent: (id) => {
        const doc = get().documents.find((d) => d.id === id);
        return doc ? doc.content : null;
      },

      uploadDocument: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        // We use the basic upload endpoint
        const res = await fetch(`${API_URL}/api/documents/upload`, {
          method: "POST",
          // headers: { Authorization: ... } // Managed by browser or global auth logic if needed
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Error subiendo archivo. WADI lo rechazó.");
        }

        const data = await res.json();

        const newDoc: Document = {
          id: crypto.randomUUID(),
          filename: data.filename,
          content: data.content,
          size: data.size,
          tokens: data.tokens,
          uploadedAt: new Date().toISOString(),
        };

        get().addDocument(newDoc);
        return newDoc;
      },
    }),
    {
      name: "wadi-documents-storage",
    }
  )
);
