import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: "../../.env" });
}
import { Worker } from "bullmq";
import { createRedis } from "@wadi/core";
import type { ChatJobInput, ChatJobOutput } from "@wadi/core";
import { runBrain } from "@wadi/core";

const connection = createRedis();

// Define processor
const worker = new Worker<ChatJobInput, ChatJobOutput>(
  "chat",
  async (job) => {
    console.log(`[Worker] Processing job ${job.id} for user ${job.data.userId}`);
    
    // Construct the messages array for runBrain from the simple input
     const messages = [
        { role: "user", content: job.data.message }
     ];

    const result = await runBrain(messages);

    return {
      ok: true,
      response: result,
      degraded: result.meta?.degraded
    };
  },
  { 
    connection: connection as any, 
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
  }
);

worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

console.log("WADI Worker running...");
