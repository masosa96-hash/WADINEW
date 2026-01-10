import { create } from "zustand";
import { supabase } from "../config/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: () => Promise<void>; // Redirects to OAuth or handles login flow
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch (error) {
      console.error("Auth init error:", error);
    } finally {
      set({ loading: false });
    }
  },

  signIn: async () => {
    // For Beta 1, we might use Email/Password via Supabase Auth UI or manual methods
    // Or just expose Supabase methods directly in components.
    // Store just holds state. Components will call supabase.auth.signInWithPassword directly or we wrap it here.
    // Let's wrap standard sign in later if needed, but for now store focuses on State.
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
