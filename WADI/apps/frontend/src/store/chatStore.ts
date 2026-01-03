import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../config/supabase";
import { useLogStore } from "./logStore";
import imageCompression from "browser-image-compression";

const rawUrl = import.meta.env.VITE_API_URL;
const API_URL = rawUrl
  ? rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")
  : "https://wadi-wxg7.onrender.com";

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  activeId: string | null;
  conversationTitle: string | null;
  isLoading: boolean;
  isTyping: boolean; // isWadiThinking replacement
  isUploading: boolean;
  isSidebarOpen: boolean;
  selectedIds: string[]; // For bulk actions

  // Actions
  fetchConversations: () => Promise<void>;
  openConversation: (id: string, initialTitle?: string) => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteSelectedConversations: (ids?: string[]) => Promise<void>;

  uploadFile: (file: File) => Promise<Attachment | null>;
  subscribeToMessages: (conversationId: string) => () => void;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;

  resetChat: () => void;
  wipeChatData: () => Promise<void>;
  exportData: () => void;

  auditCount: number;
  riskCount: number;
  fetchCriminalSummary: () => Promise<void>;

  // Deprecated/Legacy compatibility aliases
  isWadiThinking: boolean;
  conversationId: string | null;
  startNewChat: () => void;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      activeId: null,
      get conversationId() {
        return get().activeId;
      },
      conversationTitle: null,
      isLoading: false,
      isTyping: false,
      isUploading: false,
      isSidebarOpen: false,
      selectedIds: [],
      auditCount: 0,
      riskCount: 0,

      // Aliases
      get isWadiThinking() {
        return get().isTyping;
      },

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      fetchCriminalSummary: async () => {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/user/criminal-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({
              auditCount: data.totalAudits || 0,
              riskCount: data.totalHighRisks || 0,
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchConversations: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false });

        set({ conversations: data || [] });
      },

      loadConversations: async () => {
        return get().fetchConversations();
      },

      openConversation: async (id: string, initialTitle?: string) => {
        set({
          activeId: id,
          conversationTitle: initialTitle || null,
          messages: [],
          isLoading: true,
        });

        const { data: messages, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true });

        if (!error && messages) {
          set({ messages: messages as Message[], isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      loadConversation: async (id: string) => {
        return get().openConversation(id);
      },

      startNewConversation: async (initialTitle?: string) => {
        set({
          activeId: null,
          conversationTitle: initialTitle || null,
          messages: [],
          isTyping: false,
        });
        return null;
      },

      startNewChat: () => {
        set({
          activeId: null,
          conversationTitle: null,
          messages: [],
          isTyping: false,
        });
      },

      sendMessage: async (content: string, attachments: Attachment[] = []) => {
        const { activeId } = get();
        set({ isTyping: true });

        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: content,
              conversationId: activeId,
              attachments,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            if (!activeId && data.conversationId) {
              set({ activeId: data.conversationId });
              get().fetchConversations();
            }
            if (activeId || data.conversationId) {
              const convId = activeId || data.conversationId;
              const { data: msgs } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", convId)
                .order("created_at", { ascending: true });
              if (msgs) set({ messages: msgs as Message[] });
            }
          }
        } catch (error) {
          console.error("Error sending message:", error);
          useLogStore
            .getState()
            .addLog("Error enviando mensaje al cerebro.", "error");
        } finally {
          set({ isTyping: false });
        }
      },

      deleteConversation: async (id: string) => {
        await supabase.from("conversations").delete().eq("id", id);
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
          messages: state.activeId === id ? [] : state.messages,
        }));
      },

      toggleSelection: (id) => {
        const { selectedIds } = get();
        const newSelection = selectedIds.includes(id)
          ? selectedIds.filter((item) => item !== id)
          : [...selectedIds, id];
        set({ selectedIds: newSelection });
      },

      selectAll: () => {
        const { conversations } = get();
        set({ selectedIds: conversations.map((c) => c.id) });
      },

      deleteSelectedConversations: async (ids?: string[]) => {
        const { selectedIds } = get();
        const validIds = ids && ids.length > 0 ? ids : selectedIds;
        if (validIds.length === 0) return;

        await supabase.from("conversations").delete().in("id", validIds);

        set((state) => ({
          conversations: state.conversations.filter(
            (c) => !validIds.includes(c.id)
          ),
          selectedIds: ids ? state.selectedIds : [],
          activeId: validIds.includes(state.activeId || "")
            ? null
            : state.activeId,
          messages: validIds.includes(state.activeId || "")
            ? []
            : state.messages,
        }));
      },

      resetChat: () => {
        set({ activeId: null, messages: [], conversationTitle: null });
      },

      wipeChatData: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("conversations").delete().eq("user_id", user.id);
          set({ conversations: [], messages: [], activeId: null });
        }
      },

      uploadFile: async (file: File) => {
        set({ isUploading: true });
        const log = useLogStore.getState().addLog;
        log(`Iniciando procesamiento de archivo: ${file.name}`, "process");

        try {
          const chatId = get().activeId || "new";
          const fileExt = file.name.split(".").pop();
          const fileName = `${chatId}/${Date.now()}.${fileExt}`;

          let fileToUpload = file;

          if (file.type.startsWith("image/")) {
            log(
              "Detectada imagen. Iniciando compresión inteligente...",
              "process"
            );
            try {
              const options = {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 1920,
              };
              const compressedFile = await imageCompression(file, options);
              fileToUpload = new File([compressedFile], file.name, {
                type: compressedFile.type,
              });
              log(
                `Compresión finalizada. ${(file.size / 1024).toFixed(0)}KB -> ${(compressedFile.size / 1024).toFixed(0)}KB`,
                "success"
              );
            } catch (cErr) {
              console.warn("Compression failed, using original file", cErr);
              log("Fallo en compresión. Usando archivo original.", "warning");
            }
          }

          log(`Subiendo ${fileName} a Supabase Storage...`, "info");
          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(fileName, fileToUpload, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("attachments")
            .getPublicUrl(fileName);

          set({ isUploading: false });
          log("Subida completada. URL pública generada.", "success");

          return {
            url: data.publicUrl,
            name: file.name,
            type: file.type,
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          set({ isUploading: false });
          if (error instanceof Error)
            log(`Error crítico en subida: ${error.message}`, "error");
          else log("Error desconocido en subida.", "error");
          return null;
        }
      },

      subscribeToMessages: (conversationId: string) => {
        const channel = supabase
          .channel(`chat:${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              const newMessage = payload.new as unknown as Message;
              set((state) => {
                const alreadyExists = state.messages.some(
                  (m) => m.id === newMessage.id
                );
                if (alreadyExists) return state;

                const incomingMsg: Message = {
                  id: newMessage.id,
                  content: newMessage.content,
                  role: newMessage.role,
                  created_at: newMessage.created_at,
                };

                let newTypingState = state.isTyping;
                if (incomingMsg.role === "assistant") {
                  newTypingState = false;
                  useLogStore
                    .getState()
                    .addLog(
                      "Señal neural recibida: WADI ha respondido.",
                      "success"
                    );
                }

                return {
                  messages: [...state.messages, incomingMsg],
                  isTyping: newTypingState,
                };
              });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },
      exportData: () => {
        const { conversations, messages } = get();
        const dataStr = JSON.stringify({ conversations, messages }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `wadi-backup-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }),
    {
      name: "wadi-chat-storage",
      partialize: (state) => ({
        activeId: state.activeId,
      }),
    }
  )
);
