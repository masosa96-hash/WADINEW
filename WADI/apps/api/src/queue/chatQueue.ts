import { Queue } from "bullmq";
import { createRedis } from "@wadi/core";
import type { ChatJobInput } from "@wadi/core";

const connection = createRedis();

export const chatQueue = new Queue<ChatJobInput>("chat", {
  connection: connection as any,
});
