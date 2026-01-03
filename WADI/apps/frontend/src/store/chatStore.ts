import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../config/supabase";
import { useLogStore } from "./logStore";

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
  startNewConversation: (initialTitle?: string) => Promise<string | null>; // Updated signature
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteSelectedConversations: (ids?: string[]) => Promise<void>;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;

  resetChat: () => void;
  wipeChatData: () => Promise<void>;

  // Deprecated/Legacy compatibility aliases
  isWadiThinking: boolean;
  conversationId: string | null; // For compatibility
  startNewChat: () => void; // Alias for compatibility
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      activeId: null,
      get conversationId() {
        return get().activeId;
      }, // Getter alias
      conversationTitle: null,
      isLoading: false,
      isTyping: false,
      isUploading: false,
      isSidebarOpen: false,
      selectedIds: [],

      // Aliases
      get isWadiThinking() {
        return get().isTyping;
      },

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

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

      // Updated to match previous signature more closely if components rely on it returning promise string
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
            // Trigger immediate refresh or wait for realtime
            if (activeId || data.conversationId) {
              // A simple re-fetch of messages could be done here or handled by realtime component
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
    }),
    {
      name: "wadi-chat-storage",
      partialize: (state) => ({
        activeId: state.activeId,
      }),
    }
  )
);
