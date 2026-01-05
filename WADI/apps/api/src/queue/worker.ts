import { Worker } from "bullmq";
import { createRedis } from "@wadi/core";
import { runBrain } from "@wadi/core";
import { chatQueue } from "./chatQueue.js";

// Singleton worker instance to avoid duplicates in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let worker: Worker<any, any, string> | null = null;

export function startWorker() {
  if (worker) {
    console.log("[Worker] Already running.");
    return;
  }

  console.log("[Worker] Starting chat worker...");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  worker = new Worker<any, any, string>(
    "chat",
    async (job) => {
      console.log(
        `[Worker] Processing job ${job.id} for user ${job.data.userId}`
      );

      // Use pre-computed messages from API if available (Legacy/Fallback: simple user msg)
      const messages = job.data.messages || [{ role: "user", content: job.data.message }];

      const result = await runBrain(messages);

      return {
        ok: true,
        response: result,
        degraded: result.meta?.degraded,
      };
    },
    {
      connection: createRedis() as any,
      concurrency: 3,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
  });
}
