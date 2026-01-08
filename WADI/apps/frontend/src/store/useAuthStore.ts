import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

interface AuthResponse {
  data: unknown;
  error: { message: string; status?: number } | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthResponse>;
  signUp: (
    identifier: string,
    password: string,
    captchaToken?: string
  ) => Promise<AuthResponse>;
  verifyOtp: (identifier: string, token: string, type?: 'signup' | 'login' | 'recovery' | 'invite' | 'magiclink' | 'email_change') => Promise<AuthResponse>;
  loginAsGuest: () => Promise<AuthResponse>;
  convertGuestToUser: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  initializeAuth: async () => {
    set({ loading: true });
    // Check active session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user || null, loading: false });

    // Listen to changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user || null });
    });
  },

  signIn: async (identifier, password) => {
    set({ loading: true });
    
    const isPhone = identifier.startsWith("+") || /^\d+$/.test(identifier);
    const options = isPhone 
      ? { phone: identifier, password } 
      : { email: identifier, password };

    const { data, error } = await supabase.auth.signInWithPassword(options);

    set({ user: data.user, loading: false });
    return { data: data as unknown, error: error as { message: string; status?: number } | null };
  },

  signUp: async (identifier, password, captchaToken) => {
    set({ loading: true });

    const isPhone = identifier.startsWith("+") || /^\d+$/.test(identifier);
    
    const { data, error } = await (isPhone 
      ? supabase.auth.signUp({ phone: identifier, password })
      : supabase.auth.signUp({ email: identifier, password, options: { captchaToken } }));

    // If confirmation is required, the user will be null or session will be null
    set({ user: data.user, loading: false });
    return { data: data as unknown, error: error as { message: string; status?: number } | null };
  },

  verifyOtp: async (identifier, token, type = 'signup') => {
    set({ loading: true });
    
    const isPhone = identifier.startsWith("+") || /^\d+$/.test(identifier);
    
    const { data, error } = await (isPhone 
      ? supabase.auth.verifyOtp({ phone: identifier, token, type: 'sms' })
      : supabase.auth.verifyOtp({ email: identifier, token, type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' }));

    if (!error) {
      set({ user: data.user });
    }
    
    set({ loading: false });
    return { data: data as unknown, error: error as { message: string; status?: number } | null };
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

      set({ loading: false });
      return { data: data as unknown, error: error as { message: string; status?: number } | null };
    }

    // Success (New User Conversion)
    set({ user: data.user, loading: false });
    return { data, error };
  },

  resetPassword: async (email) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    set({ loading: false });
    return { data: data as unknown, error: error as { message: string; status?: number } | null };
  },

  updatePassword: async (password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.updateUser({ password });
    set({ loading: false });
    return { data: data as unknown, error: error as { message: string; status?: number } | null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
