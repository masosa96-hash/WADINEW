import { createContext } from "react";

export type HealthStatus = "checking" | "ok" | "error";

export interface BackendHealthContextType {
  status: HealthStatus;
  retry: () => void;
  attempts: number;
}

export const BackendHealthContext = createContext<BackendHealthContextType | undefined>(
  undefined
);
