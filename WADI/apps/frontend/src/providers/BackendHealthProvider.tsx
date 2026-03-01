import {
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { BackendHealthContext } from "./BackendHealthContext";
import type { HealthStatus } from "./BackendHealthContext";

const MAX_RETRY_DELAY = 10000; // 10 seconds max delay
const MAX_ATTEMPTS = 5; // Circuit breaker after 5 fails

export const BackendHealthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [attempts, setAttempts] = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setStatus("ok");
        setAttempts(0); // Reset attempts on success
      } else {
        throw new Error("Backend not OK");
      }
    } catch {
      setStatus("error");
      setAttempts((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (status === "ok") return; // Stop checking if healthy

    if (attempts >= MAX_ATTEMPTS) {
      console.error("Backend unreachable. Circuit broken.");
      return; 
    }

    // Exponential backoff: 2s, 4s, 8s, 10s...
    // 1st attempt = immediate (from initial mount)
    // 2nd = 2s, 3rd = 4s, etc.
    const delay =
      attempts === 0
        ? 0
        : Math.min(1000 * Math.pow(2, attempts), MAX_RETRY_DELAY);

    const timeoutId = setTimeout(() => {
      checkHealth();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [attempts, status, checkHealth]);

  const manualRetry = useCallback(() => {
    setStatus("checking");
    setAttempts(0); // Reset circuit breaker
  }, []);

  return (
    <BackendHealthContext.Provider
      value={{ status, retry: manualRetry, attempts }}
    >
      {children}
    </BackendHealthContext.Provider>
  );
};
