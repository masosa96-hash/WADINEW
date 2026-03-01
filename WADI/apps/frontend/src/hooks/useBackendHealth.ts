import { useState, useEffect } from "react";

export function useBackendHealth() {
  const [healthStatus, setHealthStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setHealthStatus("ok");
        } else {
          setHealthStatus("error");
        }
      } catch {
        setHealthStatus("error");
      }
    };

    checkHealth();
  }, []);

  return healthStatus;
}
