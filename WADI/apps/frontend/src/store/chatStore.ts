import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WadiMood } from "../components/WadiOnboarding";
import { supabase } from "../config/supabase";
import imageCompression from "browser-image-compression";
import { useLogStore } from "./logStore";

const rawUrl = import.meta.env.VITE_API_URL;
let apiUrl = rawUrl || "https://wadi-wxg7.onrender.com";

// Runtime check: If we are NOT on localhost, we should NOT call localhost.
if (
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1"))
) {
  console.warn(
    "Detected localhost API URL in production/remote. Switching to relative path."
  );
  apiUrl = "";
}

// Make API_URL exported so components can reuse it
export const API_URL = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

// New Type Definition
export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[]; // Refactored to Object Array
  created_at?: string;
  diagnosis?: string; // WADI visual tag for user patterns
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
}

export type ChatMode = "normal" | "tech" | "biz" | "tutor";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  customPrompt?: string | null;
  aiModel?: "fast" | "deep";
  messages: Message[];
}

interface ChatState {
  // State
  messages: Message[];
  conversations: Conversation[];
  conversationId: string | null;
  conversationTitle: string | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
  mood: WadiMood;
  isSidebarOpen: boolean;
  isPanicMode: boolean; // EMERGENCY OVERRIDE
  isUploading: boolean;
  activeFocus: string | null;

  // Gamification
  rank: string;
  points: number;
  systemDeath: boolean;

  // Criminal Record (Long Term Memory)
  criminalRecord: {
    auditCount: number;
    riskCount: number;
  };

  // Memory
  memory: Record<string, string>;
  remember: (key: string, value: string) => void;
  recall: () => Record<string, string>;
  forget: () => void;

  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string | null;

  createWorkspace: (name: string) => void;
  switchWorkspace: (name: string) => boolean;
  deleteWorkspace: (name: string) => boolean;
  listWorkspaces: () => Workspace[];

  // Settings for NEW conversation
  mode: ChatMode;
  topic: string;
  explainLevel: "short" | "normal" | "detailed";

  // Actions
  setPreset: (
    preset: "tech" | "biz" | "learning" | "productivity" | "reflexivo"
  ) => void;
  setMood: (mood: WadiMood) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  togglePanicMode: () => void;
  setPanicMode: (isPanic: boolean) => void;

  setExplainLevel: (level: "short" | "normal" | "detailed") => void;

  fetchConversations: () => Promise<void>;
  fetchCriminalSummary: () => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<Attachment | null>;
  sendMessage: (
    text: string,
    attachments?: Attachment[]
  ) => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  resetChat: () => void;
  admitFailure: () => Promise<void>;
  // Settings
  settings: {
    sarcasmLevel: number; // 0 (Soft) to 100 (Nuclear)
    theme: "light" | "dark" | "system";
    language: "es" | "en";
    defaultMode: ChatMode;
  };
  aiModel: "fast" | "deep";
  customSystemPrompt: string | null;

  updateSettings: (settings: Partial<ChatState["settings"]>) => void;
  setAiModel: (model: "fast" | "deep") => void;
  setCustomSystemPrompt: (prompt: string | null) => void;
  getSystemPrompt: () => Promise<string>;
  exportData: () => Promise<void>;
  clearAllChats: () => Promise<void>;

  crystallizeProject: (name: string, description: string) => Promise<boolean>;
  // Action to trigger visual alert
  triggerVisualAlert: () => void;
  visualAlertTimestamp: number;
  triggerScorn: () => void;
  scornTimestamp: number;
}

// Helper to get token
const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Default State
      messages: [],
      conversations: [],
      conversationId: null,
      conversationTitle: null,
      isLoading: false,
      error: null,
      hasStarted: false,
      mood: "hostile",

      isSidebarOpen: false,
      isPanicMode: false,
      isUploading: false,
      activeFocus: null,
      rank: "GENERADOR_DE_HUMO",
      points: 0,
      systemDeath: false,
      criminalRecord: { auditCount: 0, riskCount: 0 },

      // Memory Init
      memory: {},
      remember: (key, value) =>
        set((state) => ({
          memory: { ...state.memory, [key]: value },
        })),
      recall: () => get().memory,
      forget: () => set({ memory: {} }),

      mode: "normal",
      topic: "general",
      explainLevel: "normal",
      visualAlertTimestamp: 0,
      scornTimestamp: 0,

      // Settings Defaults
      aiModel: "fast",
      customSystemPrompt: null,
      settings: {
        sarcasmLevel: 50,
        theme: "dark",
        language: "es",
        defaultMode: "normal",
      },

      // Workspaces Init
      workspaces: [],
      activeWorkspaceId: null,

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      togglePanicMode: () =>
        set((state) => ({ isPanicMode: !state.isPanicMode })),
      setPanicMode: (isPanic) => set({ isPanicMode: isPanic }),

      createWorkspace: (name) => {
        const newWorkspace: Workspace = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          customPrompt: get().customSystemPrompt,
          aiModel: get().aiModel,
          messages: get().messages,
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: newWorkspace.id,
        }));
      },

      switchWorkspace: (name) => {
        const state = get();
        // 1. Save current state to active workspace before switching?
        // Ideally we auto-save on change, but for now let's just find target.

        const target = state.workspaces.find((w) => w.name === name);
        if (!target) return false;

        // If there was an active workspace, update it first
        if (state.activeWorkspaceId) {
          const updatedWorkspaces = state.workspaces.map((w) => {
            if (w.id === state.activeWorkspaceId) {
              return {
                ...w,
                messages: state.messages,
                customPrompt: state.customSystemPrompt,
                aiModel: state.aiModel,
              };
            }
            return w;
          });
          set({ workspaces: updatedWorkspaces });
        }

        // Load target
        set({
          activeWorkspaceId: target.id,
          messages: target.messages,
          customSystemPrompt: target.customPrompt || null,
          aiModel: target.aiModel || "fast",
          // Reset conversation ID to avoid sync conflicts with backend for now
          conversationId: null,
        });
        return true;
      },

      deleteWorkspace: (name) => {
        const state = get();
        const target = state.workspaces.find((w) => w.name === name);
        if (!target) return false;

        const remaining = state.workspaces.filter((w) => w.id !== target.id);

        // If we deleted the active one, revert to default "no workspace" state
        if (state.activeWorkspaceId === target.id) {
          set({
            activeWorkspaceId: null,
            workspaces: remaining,
            // Optional: clear messages or keep them as "detached"
          });
        } else {
          set({ workspaces: remaining });
        }
        return true;
      },

      listWorkspaces: () => get().workspaces,

      triggerVisualAlert: () => set({ visualAlertTimestamp: Date.now() }),
      triggerScorn: () => set({ scornTimestamp: Date.now() }),

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setAiModel: (model) => set({ aiModel: model }),
      setCustomSystemPrompt: (prompt) => set({ customSystemPrompt: prompt }),

      getSystemPrompt: async () => {
        const state = get();
        // If we have a custom override, return that
        if (state.customSystemPrompt) return state.customSystemPrompt;

        try {
          const token = await getToken();
          // We call the debug endpoint
          const res = await fetch(`${API_URL}/api/debug/system-prompt`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              mode: state.mode,
              topic: state.topic,
              explainLevel: state.explainLevel,
              isMobile: window.innerWidth < 1024,
              messageCount: state.messages.length,
            }),
          });
          const data = await res.json();
          return data.prompt || "Error fetching prompt";
        } catch (e) {
          console.warn("Failed to fetch system prompt:", e);
          return "Error retrieving system prompt.";
        }
      },

      exportData: async () => {
        const state = get();
        const data = {
          conversations: state.conversations,
          profile: { rank: state.rank, points: state.points },
          settings: state.settings,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wadi_export_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      },

      clearAllChats: async () => {
        try {
          const token = await getToken();
          if (!token) return;
          // We'll iterate and delete for now, or assume backend has a bulk delete (it doesn't yet, so careful)
          // Ideally we create a bulk delete endpoint, but for this step we will iterate locally or clear local state.
          const convs = get().conversations;
          for (const c of convs) {
            await fetch(`${API_URL}/api/conversations/${c.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          get().resetChat();
          set({ conversations: [] });
        } catch (e) {
          console.error("Failed to clear chats", e);
        }
      },

      setPreset: (preset) =>
        set((state) => {
          switch (preset) {
            case "tech":
              return {
                ...state,
                mode: "tech",
                topic: "general",
                explainLevel: "normal",
              };
            case "biz":
              return {
                ...state,
                mode: "biz",
                topic: "negocios",
                explainLevel: "normal",
              };
            case "learning":
              return {
                ...state,
                mode: "tutor",
                topic: "aprendizaje",
                explainLevel: "detailed",
              };
            case "productivity":
              return {
                ...state,
                mode: "normal",
                topic: "productividad",
                explainLevel: "short",
              };
            case "reflexivo":
              return {
                ...state,
                mode: "normal",
                topic: "general",
                explainLevel: "normal",
              };
            default:
              return state;
          }
        }),

      setMood: (mood) => set({ mood }),

      setExplainLevel: (level) => set({ explainLevel: level }),

      resetChat: () =>
        set({
          conversationId: null,
          conversationTitle: null,
          messages: [],
          error: null,
          hasStarted: false,
        }),

      startNewConversation: async (initialTitle?: string) => {
        set({
          conversationId: null,
          conversationTitle: initialTitle || null,
          messages: [],
          error: null,
          isLoading: false,
        });
        return null;
      },

      fetchConversations: async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const res = await fetch(`${API_URL}/api/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch conversations");
          const data = await res.json();
          set({ conversations: data });
        } catch (err) {
          console.error(err);
        }
      },

      loadConversations: async () => {
        return get().fetchConversations();
      },

      fetchCriminalSummary: async () => {
        try {
          const token = await getToken();
          if (!token) return;
          const res = await fetch(`${API_URL}/api/user/criminal-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({
              criminalRecord: {
                auditCount: data.totalAudits,
                riskCount: data.totalHighRisks,
              },
            });
          }
        } catch (e) {
          console.warn("Failed to fetch criminal record", e);
        }
      },

      openConversation: async (id: string) => {
        try {
          set({
            isLoading: true,
            error: null,
            conversationId: id,
            messages: [],
          });
          const token = await getToken();
          if (!token) return;

          const res = await fetch(`${API_URL}/api/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error("Failed to load conversation");
          }

          const data = await res.json();
          set({
            messages: data.messages || [],
            conversationTitle: data.title,
            mode: data.mode as ChatMode,
            explainLevel: data.explain_level,
            isLoading: false,
            hasStarted: data.messages && data.messages.length > 0,
          });
        } catch (err: unknown) {
          console.error(err);
          set({ isLoading: false, hasStarted: false });
        }
      },

      loadConversation: async (id: string) => {
        return get().openConversation(id);
      },

      uploadFile: async (file: File) => {
        set({ isUploading: true });
        const log = useLogStore.getState().addLog;
        log(`Iniciando procesamiento de archivo: ${file.name}`, "process");

        try {
          const chatId = get().conversationId || "new";
          const fileExt = file.name.split(".").pop();
          const fileName = `${chatId}/${Date.now()}.${fileExt}`;

          let fileToUpload = file;

          // COMPRESSION LOGIC
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
          set({ isUploading: false, error: "Error al subir archivo." });
          if (error instanceof Error)
            log(`Error crítico en subida: ${error.message}`, "error");
          else log("Error desconocido en subida.", "error");
          return null;
        }
      },

      crystallizeProject: async (name: string, description: string) => {
        try {
          const token = await getToken();
          if (!token) return false;

          set({ isLoading: true });

          const res = await fetch(`${API_URL}/api/projects/crystallize`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, description }),
          });

          if (!res.ok) throw new Error("Failed to crystallize");

          const data = await res.json();

          // Add System Confirmation
          const sysMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `[PROYECTO_CRISTALIZADO: ${data.name}]`,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, sysMsg],
            isLoading: false,
          }));

          return true;
        } catch (e) {
          console.error(e);
          set({ isLoading: false, error: "Fallo al cristalizar proyecto." });
          return false;
        }
      },

      admitFailure: async () => {
        try {
          const token = await getToken();
          if (!token) return;

          set({ isLoading: true });

          const res = await fetch(`${API_URL}/api/user/admit-failure`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();

          // Inject Monday's crushing response
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, aiMsg],
            isLoading: false,
            activeFocus: null, // Cleared
            points: data.efficiencyPoints,
            rank: data.efficiencyRank,
          }));
        } catch (e) {
          console.error(e);
          set({ isLoading: false });
        }
      },

      sendMessage: async (text: string, attachments: Attachment[] = []) => {
        if (!text.trim() && attachments.length === 0) return null;

        // OPTIMISTIC UPDATE START
        const tempId = crypto.randomUUID();
        const userMsg: Message = {
          id: tempId,
          role: "user",
          content: text,
          attachments: attachments,
          created_at: new Date().toISOString(),
        };

        useLogStore
          .getState()
          .addLog("Enviando mensaje a la Matrix (Supabase)...", "process");

        set((state) => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          error: null,
          hasStarted: true,
        }));
        // OPTIMISTIC UPDATE END

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuario no autenticado");

          let currentConversationId = get().conversationId;

          // 1. Create Conversation if needed
          if (!currentConversationId) {
            useLogStore
              .getState()
              .addLog(
                "Creando nueva línea temporal (Conversación)...",
                "process"
              );
            const { data: newConv, error: convError } = await supabase
              .from("conversations")
              .insert({
                user_id: user.id,
                title: text.slice(0, 50),
                mode: get().mode || "normal",
              })
              .select()
              .single();

            if (convError) throw convError;
            currentConversationId = newConv.id;
            set({ conversationId: currentConversationId });
          }

          // 2. Insert Message into Supabase
          const { error: msgError } = await supabase.from("messages").insert([
            {
              content: text,
              conversation_id: currentConversationId,
              user_id: user.id,
              role: "user",
              // Note: Attachments column implementation pending backend update to JSONB
              // For now we persist text content.
            },
          ]);

          if (msgError) throw msgError;

          useLogStore
            .getState()
            .addLog(
              "Mensaje insertado en Base de Datos. Esperando Edge Function...",
              "success"
            );

          // We do not wait for a reply here anymore, as the architecture shifts to Async/Edge
          set({ isLoading: false }); // Stop loader

          return currentConversationId;
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          set({ isLoading: false, error: errorMessage });
          useLogStore
            .getState()
            .addLog(
              `Falla de comunicación con base de datos: ${errorMessage}`,
              "error"
            );
          return null;
        }
      },

      deleteConversation: async (id: string) => {
        try {
          const token = await getToken();
          const res = await fetch(`${API_URL}/api/conversations/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Delete failed");

          set((state) => {
            const nextConversations = state.conversations.filter(
              (c) => c.id !== id
            );
            // If current open conversation is deleted, reset
            if (state.conversationId === id) {
              return {
                conversations: nextConversations,
                conversationId: null,
                conversationTitle: null,
                messages: [],
              };
            }
            return { conversations: nextConversations };
          });
        } catch (err) {
          console.error(err);
        }
      },
    }),
    {
      name: "wadi-session-v1",
      partialize: (state) => ({
        mood: state.mood,
        conversationId: state.conversationId,
        messages: state.messages,
        hasStarted: state.hasStarted,
        aiModel: state.aiModel,
        customSystemPrompt: state.customSystemPrompt,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        memory: state.memory,
        // Don't persist isUploading or blocked states if they are ephemeral
      }),
      onRehydrateStorage: () => () => {
        // [FIX]: Removed automatic "Volviste" greeting on rehydration to prevent repetitive messages.
        // The persistence should just restore state as is.
      },
    }
  )
);
