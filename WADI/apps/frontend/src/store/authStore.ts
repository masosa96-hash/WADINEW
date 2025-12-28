import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

interface AuthResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    captchaToken?: string
  ) => Promise<AuthResponse>;
  loginAsGuest: () => Promise<AuthResponse>;
  convertGuestToUser: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ user: data.user, loading: false });
    return { data, error };
  },

  signUp: async (email, password, captchaToken) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { captchaToken },
    });

    set({ user: data.user, loading: false });
    return { data, error };
  },

  loginAsGuest: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) console.error("Error login anónimo:", error);
    set({ user: data.user, loading: false });
    return { data, error };
  },

  convertGuestToUser: async (email, password) => {
    set({ loading: true });

    // 1. Capture current anon ID
    const {
      data: { session: anonSession },
    } = await supabase.auth.getSession();
    const anonUserId = anonSession?.user?.id;

    // 2. Attempt to convert (Update User)
    const { data, error } = await supabase.auth.updateUser({
      email: email,
      password: password,
    });

    if (error) {
      // 3. Handle "User already exists" conflict
      // Note: Error message content may vary, checking for common indicators
      if (
        error.message.includes("already registered") ||
        error.message.includes("unique constraint") ||
        error.status === 422
      ) {
        console.log("Email exists. Attempting to link/merge account...");

        // 4. Sign in to the existing account
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          set({ loading: false });
          throw new Error(
            "El usuario ya existe y la contraseña es incorrecta."
          );
        }

        if (signInData.user && anonUserId) {
          console.log(
            `Merging data from ${anonUserId} to ${signInData.user.id}`
          );

          // 5. Reassign entities (Projects & Runs)
          // Note: This relies on RLS policies allowing the new user to update the old user's rows
          // OR the backend handling this. We attempt client-side update here as per request.

          const { error: projectError } = await supabase
            .from("projects")
            .update({ user_id: signInData.user.id }) // Assuming 'user_id' column exists
            .eq("user_id", anonUserId); // Assuming logical 'owner' link

          if (projectError)
            console.warn("Project merge warning:", projectError);

          const { error: runError } = await supabase
            .from("runs")
            .update({ user_id: signInData.user.id })
            .eq("user_id", anonUserId);

          if (runError) console.warn("Run merge warning:", runError);
        }

        set({ user: signInData.user, loading: false });
        // Return null error to indicate success in handling
        return { data: signInData, error: null };
      }

      // Real error
      set({ loading: false });
      return { data, error };
    }

    // Success (New User Conversion)
    set({ user: data.user, loading: false });
    return { data, error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
