import IORedis from "ioredis";

let redis: IORedis | null = null;

export function createRedis(): IORedis {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL");
  }

  // Render/Cloud Redis often needs TLS if protocol is 'rediss:'
  const isSecure = url.startsWith("rediss:");

  // Use lazyConnect: true to avoid throwing immediately on import if Redis is down/unreachable
  redis = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    tls: isSecure ? { rejectUnauthorized: false } : undefined, // Relaxed TLS for internal/self-signed
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 2000);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        // Only reconnect when the error starts with "READONLY"
        return true;
      }
      return false;
    },
  });

  redis.on("connect", () => {
    console.log("[redis] connected");
  });

  redis.on("error", (err) => {
    // Only log critical connection errors to avoid noise
    if (err.message.includes("ECONNREFUSED")) {
      console.error("[redis] Connection refused. Check REDIS_URL and Region.");
    } else {
      console.error("[redis] error", err.message);
    }
  });

  return redis;
}
