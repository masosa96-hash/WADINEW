import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export function useBackendHealth() {
  const [healthStatus, setHealthStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
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
