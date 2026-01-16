import { useEffect } from 'react';
import { API_URL } from '../config/api';

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (Render sleeps after 15m inactivity)

export function KeepAlive() {
  useEffect(() => {
    const ping = async () => {
      try {
        const rootUrl = API_URL.replace(/\/api$/, "");
        await fetch(`${rootUrl}/health`);
        // console.log("💓 WADI Heartbeat");
      } catch (e) {
        // console.warn("Heartbeat failed", e);
      }
    };

    // Ping on mount
    ping();

    // Ping periodically
    const interval = setInterval(ping, PING_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return null; // Invisible component
}
