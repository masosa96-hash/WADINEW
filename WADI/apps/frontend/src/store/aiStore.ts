import { create } from 'zustand';
import { API_URL, getHeaders } from '../config/api';
import { useAuthStore } from './authStore';

interface AIState {
  isProcessing: boolean;
  lastResponse: unknown | null; // AIJobOutput
  error: string | null;
  
// Actions
  startAnalysis: () => void;
  pollJob: (jobId: string) => Promise<void>;
  reset: () => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isProcessing: false,
  lastResponse: null,
  error: null,

  startAnalysis: () => set({ isProcessing: true, lastResponse: null, error: null }),

  pollJob: async (jobId: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
        set({ isProcessing: false, error: "Authentication lost" });
        return;
    }

    const POLLING_INTERVAL = 3000;
    const MAX_ATTEMPTS = 20; // 1 minute timeout
    let attempts = 0;

    const intervalId = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/v2/projects/analysis/${jobId}`, {
            headers: getHeaders(token)
        });

        if (!res.ok) {
            // If 404, maybe job isn't ready yet, but if 500 or other, fail
            if (res.status !== 404) throw new Error("Failed to check job status");
        } else {
            const data = await res.json();
            // data = { jobId, state, result }

            if (data.state === 'completed') {
                clearInterval(intervalId);
                set({ 
                    isProcessing: false, 
                    lastResponse: data.result, // The AIJobOutput
                    error: null 
                });
            } else if (data.state === 'failed') {
                clearInterval(intervalId);
                set({ 
                    isProcessing: false, 
                    error: "AI Analysis Failed: " + (data.result || "Unknown error")
                });
            }
        }
      } catch (err) {
        // Log query error but keep trying until max attempts
        console.warn("Polling error:", err);
      }

      if (attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalId);
          set({ isProcessing: false, error: "Analysis timed out" });
      }
    }, POLLING_INTERVAL);
  },

  reset: () => set({ isProcessing: false, lastResponse: null, error: null }),
  setError: (msg) => set({ isProcessing: false, error: msg }),
  setSuccess: (msg) => set({ isProcessing: false, lastResponse: msg }),
}));
