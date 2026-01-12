import { Queue } from "bullmq";
import { createRedis } from "@wadi/core";
import type { AIJobInput } from "@wadi/core";

export const aiQueue = new Queue<AIJobInput>("ai_processing", {
  connection: createRedis() as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 jobs
    removeOnFail: 500,     // Keep last 500 failed jobs for debugging
  },
});
