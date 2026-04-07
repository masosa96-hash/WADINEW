import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../config/supabase";
import { useLogStore } from "./logStore";
import { handleSupabaseError } from "../utils/supabaseErrorHandler";
import imageCompression from "browser-image-compression";
import type { WadiStage, WadiProjectContext } from "@wadi/db-types";

import { API_URL } from "../config/api";

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | Record<string, unknown>;
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
  guestMessages: Message[];
  activeId: string | null;
  conversationTitle: string | null;
  chatStatus: "idle" | "loading" | "streaming" | "error" | "uploading";
  streamingContent: string;
  isSidebarOpen: boolean;
  selectedIds: string[]; // For bulk actions
  abortController: AbortController | null;
  stage: WadiStage;
  currentProjectContext: WadiProjectContext | null;
  isTyping: boolean;
  readonly isStreaming: boolean;
  readonly isLoading: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  openConversation: (id: string, initialTitle?: string) => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  sendMessageStream: (content: string) => Promise<void>;
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

  guestSessionId: string | null;
  // Deprecated/Legacy compatibility aliases
  isWadiThinking: boolean;
  conversationId: string | null;
  startNewChat: () => void;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  cancelStream: () => void;
  finalizeAndSaveProject: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      guestMessages: [],
      activeId: null,
      get conversationId() {
        return get().activeId;
      },
      conversationTitle: null,
      chatStatus: "idle",
      stage: "exploration",
      currentProjectContext: null,
      get isTyping() {
        return get().chatStatus === "loading" || get().chatStatus === "streaming";
      },
      streamingContent: "",
      isUploading: false,
      isSidebarOpen: false,
      selectedIds: [],
      auditCount: 0,
      riskCount: 0,
      abortController: null,
      guestSessionId: null,

      // Aliases
      get isWadiThinking() {
        return get().chatStatus === "loading" || get().chatStatus === "streaming";
      },
      get isLoading() {
        return get().chatStatus === "loading";
      },
      get isStreaming() {
        return get().chatStatus === "streaming";
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
        console.log("[WADI_CHAT]: Buscando conversaciones...");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
           console.warn("[WADI_CHAT]: Sin sesión, abortando fetch.");
           return;
        }

        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false });

        if (error) {
           handleSupabaseError(error, "Cargando conversaciones");
        } else {
           console.log("[WADI_CHAT]: Conversaciones recibidas:", (data as unknown[])?.length || 0);
        }

        set({ conversations: data || [] });
      },

      loadConversations: async () => {
        return get().fetchConversations();
      },

      openConversation: async (id: string, initialTitle?: string) => {
        get().cancelStream();
        set({
          activeId: id,
          conversationTitle: initialTitle || null,
          messages: [],
          chatStatus: "loading",
        });

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && id !== "guest") {
          const { data: msgs, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", id)
            .order("created_at", { ascending: true });

          if (error) {
            handleSupabaseError(error, "Cargando mensajes");
            set({ chatStatus: "error" });
          } else {
            set({ messages: (msgs as Message[]) || [], chatStatus: "idle" });
          }
        } else {
          // Guest mode: use in-memory guestMessages
          set({ messages: get().guestMessages, chatStatus: "idle" });
        }
      },

      cancelStream: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ abortController: null, chatStatus: "idle" });
        }
      },

      loadConversation: async (id: string) => {
        return get().openConversation(id);
      },

      startNewConversation: async (initialTitle?: string) => {
        get().cancelStream();
        set({
          activeId: null,
          conversationTitle: initialTitle || null,
          messages: [],
          chatStatus: "idle",
          currentProjectContext: null,
          stage: "exploration",
        });
        return null;
      },

      startNewChat: () => {
        get().cancelStream();
        set({
          activeId: null,
          conversationTitle: null,
          messages: [],
          chatStatus: "idle",
          currentProjectContext: null,
          stage: "exploration",
        });
      },

      sendMessage: async (content: string) => {
        // Legacy sendMessage refactored to use sendMessageStream if possible
        await get().sendMessageStream(content);
      },

      sendMessageStream: async (content: string) => {
        get().cancelStream();
        const controller = new AbortController();
        const now = new Date().toISOString();

        // Optimistically add user message
        const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: content, created_at: now };

        set((state) => ({
          chatStatus: "loading",
          streamingContent: "",
          abortController: controller,
          messages: [...state.messages, userMsg],
        }));

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token;

          // Ensure guest session ID exists
          let gSid = get().guestSessionId;
          if (!gSid) {
            gSid = `guest-${crypto.randomUUID()}`;
            set({ guestSessionId: gSid });
          }

          const response = await fetch(`${API_URL}/api/wadi/interpret`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : { "x-wadi-session": gSid }),
            },
            body: JSON.stringify({ message: content }),
            signal: controller.signal,
          });

          if (!response.ok) {
            set((state) => ({ 
              chatStatus: "error", 
              streamingContent: "",
              messages: [
                 ...state.messages,
                 { id: `system-${Date.now()}`, role: "assistant", content: { message: "⚠️ WADI está fuera de línea o hubo un error de conexión." }, created_at: new Date().toISOString() }
              ]
            }));
            return;
          }

          // --- SSE Streaming Reader ---
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";
          let finalData: Record<string, unknown> | null = null;

          if (!reader) throw new Error("No reader available");

          set({ chatStatus: "streaming" });

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                  const dataTrimmed = data.trim();
                  if (!dataTrimmed) continue;
                  
                  const parsed = JSON.parse(dataTrimmed);
                  
                  // Optimización: Transition inmediata si llega un stage/new_stage
                  if (parsed.stage || parsed.new_stage) {
                    const nextStage = parsed.stage || parsed.new_stage;
                    set({ stage: nextStage });
                    console.log(`[WADI_SYNC]: Transición a etapa ${nextStage}`);
                  }
                  
                  // Optimización: Sync de Blueprint (ProjectContext)
                  if (parsed.project_context) {
                    set({ currentProjectContext: parsed.project_context as WadiProjectContext });
                    console.log(`[WADI_SYNC]: Blueprint Context actualizado`);
                  }

                  // Si es contenido para el chat
                  if (parsed.content) {
                    fullContent += parsed.content;
                    set({ streamingContent: fullContent });
                  }
                  
                  // Si es la meta-data completa del pipeline (para los mensajes)
                  if (parsed.state) {
                    finalData = parsed;
                  }
                } catch (e) {
                  console.warn("[WADI_CHAT]: Sync parse error", e);
                }
              }
            }
          }

          // Finish streaming
          set((state) => ({
             chatStatus: "idle",
             abortController: null,
             streamingContent: "",
             messages: [
               ...state.messages,
               { 
                 id: `assistant-${Date.now()}`, 
                 role: "assistant", 
                 content: finalData || { message: fullContent }, 
                 created_at: new Date().toISOString() 
               }
             ]
          }));

        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("[WADI_CHAT]: Request cancelado.");
            return;
          }
          console.error("Error in sendMessageStream:", error);
          set({ chatStatus: "error", streamingContent: "", abortController: null });
        }
      },

      deleteConversation: async (id: string) => {
        // Optimistic Update
        const previousConversations = get().conversations; // Backup for rollback if needed (optional)
        const previousActive = get().activeId;

        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
          messages: state.activeId === id ? [] : state.messages,
        }));

        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) return;

        try {
          const res = await fetch(`${API_URL}/api/conversations/${id}`, {
             method: 'DELETE',
             headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error("Delete failed");
          
          // Tabla Rasa check
          if (get().conversations.length === 0) {
             useLogStore.getState().addLog("Tabla rasa. El caos se fue, ahora a ver qué plan real tenés.", "info");
          }

        } catch (error) {
          console.error("Error deleting conversation:", error);
          useLogStore.getState().addLog("Error eliminando chat. Restaurando...", "error");
          // Rollback
          set({ conversations: previousConversations, activeId: previousActive });
        }
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

        // Backup
        const previousConversations = get().conversations;
        
        // Optimistic Update
        set((state) => ({
            conversations: state.conversations.filter(
              (c) => !validIds.includes(c.id)
            ),
            selectedIds: [], // Clear selection
            activeId: validIds.includes(state.activeId || "") ? null : state.activeId,
            messages: validIds.includes(state.activeId || "") ? [] : state.messages,
        }));

        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) {
            // Restore if no token (shouldn't happen)
            set({ conversations: previousConversations });
            return;
        }

        try {
          // Use 'conversationIds' body param as per new backend spec
          const res = await fetch(`${API_URL}/api/conversations/bulk`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversationIds: validIds }),
          });

          if (!res.ok) throw new Error("Bulk delete failed");
          
           // Tabla Rasa check
          if (get().conversations.length === 0) {
             useLogStore.getState().addLog("Tabla rasa. El caos se fue, ahora a ver qué plan real tenés.", "info");
          }

        } catch (error) {
          console.error("Error deleting conversations:", error);
          useLogStore.getState().addLog("TL;DR: El servidor nos rebotó. Los chats volvieron.", "error");
          // Rollback
          set({ conversations: previousConversations, selectedIds: validIds });
        }
      },

      resetChat: () => {
        set({ 
          activeId: null, 
          messages: [], 
          conversationTitle: null,
          currentProjectContext: null,
          stage: "exploration"
        });
      },

      wipeChatData: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("conversations").delete().eq("user_id", user.id);
          set({ 
            conversations: [], 
            messages: [], 
            activeId: null,
            currentProjectContext: null,
            stage: "exploration"
          });
        }
      },

      uploadFile: async (file: File) => {
        set({ chatStatus: "uploading" });
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

          set({ chatStatus: "idle" });
          log("Subida completada. URL pública generada.", "success");

          return {
            url: data.publicUrl,
            name: file.name,
            type: file.type,
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          set({ chatStatus: "error" });
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

                if (incomingMsg.role === "assistant") {
                  useLogStore
                    .getState()
                    .addLog(
                      "Señal neural recibida: WADI ha respondido.",
                      "success"
                    );
                }

                return {
                  messages: [...state.messages, incomingMsg],
                  chatStatus: "idle",
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
      finalizeAndSaveProject: async () => {
        const { currentProjectContext } = get();
        if (!currentProjectContext) {
          useLogStore.getState().addLog("Error: No hay un blueprint activo para guardar.", "error");
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // --- GUEST HANDLING ---
        if (!token) {
          console.warn("[WADI_SYNC]: Guest detected. Saving blueprint to localStorage.");
          localStorage.setItem("wadi_pending_blueprint", JSON.stringify(currentProjectContext));
          set({ chatStatus: "idle" });
          alert("¡Blueprint cristalizado! Registrate o inicia sesión para guardarlo definitivamente en tu Dashboard.");
          useLogStore.getState().addLog("Sesión de Guest: Blueprint guardado localmente.", "warning");
          return;
        }

        set({ chatStatus: "loading" });
        try {
          const res = await fetch(`${API_URL}/api/projects/save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(currentProjectContext)
          });

          if (!res.ok) throw new Error("Error al persistir el proyecto");

          const data = await res.json();
          console.log("[WADI_SYNC]: Proyecto guardado con éxito", data);

          useLogStore.getState().addLog(`Proyecto '${currentProjectContext.project_name}' guardado en base de datos.`, "success");

          // Transición a estado de éxito
          set({ 
            stage: "project_saved", 
            chatStatus: "idle",
          });
          
        } catch (e) {
          console.error("[WADI_SAVE_ERROR]:", e);
          set({ chatStatus: "error" });
          useLogStore.getState().addLog("Error crítico al persistir el proyecto.", "error");
        }
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
