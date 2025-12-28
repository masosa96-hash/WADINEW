import React, { useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { useDocumentStore } from "../../store/documentStore";
import { useShallow } from "zustand/react/shallow";

export function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    uploadDocument,
    activeDocument,
    documents,
    removeDocument,
    setCurrentDocument,
  } = useDocumentStore(
    useShallow((state) => ({
      uploadDocument: state.uploadDocument,
      activeDocument: state.documents.find(
        (d) => d.id === state.currentDocumentId
      ),
      documents: state.documents,
      removeDocument: state.removeDocument,
      setCurrentDocument: state.setCurrentDocument,
    }))
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDocument(file);
    } catch (e) {
      console.error(e);
      alert("Error subiendo archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ACTIVE DOCUMENTS LIST */}
      {documents.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${activeDocument?.id === doc.id ? "bg-[var(--wadi-primary)]/10 border-[var(--wadi-primary)] text-[var(--wadi-primary)]" : "bg-[var(--wadi-surface)] border-[var(--wadi-border)] text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"}`}
              onClick={() => setCurrentDocument(doc.id)}
            >
              <FileText size={12} />
              <span className="max-w-[100px] truncate">{doc.filename}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDocument(doc.id);
                }}
                className="hover:text-[var(--wadi-alert)]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-3xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden bg-[var(--wadi-bg)]
        ${
          isDragging
            ? "border-[var(--wadi-primary)] bg-zinc-100 scale-[1.005]"
            : "border-zinc-300 hover:border-zinc-400"
        }`}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept=".pdf,.txt,.md"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <UploadCloud size={32} className="text-[var(--wadi-primary)]" />
            <p className="text-xs font-mono-wadi text-[var(--wadi-primary)] tracking-widest">
              INGIRIENDO DATOS...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <UploadCloud
              size={24}
              className={
                isDragging
                  ? "text-[var(--wadi-primary)]"
                  : "text-[var(--wadi-text-muted)]"
              }
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-[var(--wadi-text)]">
                Arrastrá tus documentos (sí, los que evitás leer)
              </p>
              <p className="text-[10px] text-[var(--wadi-text-muted)] uppercase tracking-wide">
                PDF, TXT, MD (EVIDENCIA REQUERIDA)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
