import { create } from "zustand";

export type LogType = "info" | "success" | "warning" | "error" | "process";

export interface LogEntry {
  id: string;
  message: string;
  type: LogType;
  timestamp: number;
}

interface LogState {
  logs: LogEntry[];
  isVisible: boolean;
  addLog: (message: string, type?: LogType) => void;
  toggleVisibility: () => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  isVisible: false,

  addLog: (message, type = "info") => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now(),
    };

    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 50), // Keep last 50
      isVisible: true, // Auto-expand on new event for visibility
    }));
  },

  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  clearLogs: () => set({ logs: [] }),
}));
