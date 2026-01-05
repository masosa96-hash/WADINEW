import IORedis from "ioredis";

export function createRedis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("Missing REDIS_URL");

  return new IORedis(url, {
    maxRetriesPerRequest: null,
  });
}
