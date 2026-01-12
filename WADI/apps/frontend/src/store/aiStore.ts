import { create } from 'zustand';

interface AIState {
  isProcessing: boolean;
  lastResponse: string | null;
  error: string | null;
  startAnalysis: () => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isProcessing: false,
  lastResponse: null,
  error: null,
  startAnalysis: () => set({ isProcessing: true, lastResponse: null, error: null }),
  setSuccess: (message) => set({ isProcessing: false, lastResponse: message, error: null }),
  setError: (message) => set({ isProcessing: false, error: message }),
  reset: () => set({ isProcessing: false, lastResponse: null, error: null }),
}));
