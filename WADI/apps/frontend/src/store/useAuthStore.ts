import { create } from "zustand";
import { supabase } from "../config/supabase";

interface Profile {
  id: string;
  [key: string]: any;
}

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;

  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  initializeAuth: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      set({ user, profile, loading: false });
    } else {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
