import { Queue } from "bullmq";
import { createRedis } from "@wadi/core";
import type { ChatJobInput } from "@wadi/core";

export const chatQueue = new Queue<ChatJobInput>("chat", {
  connection: createRedis() as any,
});
