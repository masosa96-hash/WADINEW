import { Worker, Job } from "bullmq";
import { createRedis, AIJobInput, AIJobOutput } from "@wadi/core";
import { ProjectsService } from "../domain/projects/project.service";

const connection = createRedis();

export const aiWorker = new Worker<AIJobInput, AIJobOutput>(
  "ai_processing",
  async (job: Job<AIJobInput>) => {
    console.log(`[AI Worker] Processing job ${job.id} for user ${job.data.userId}`);
    
    // Simulate AI Latency
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Fake AI Logic (Deterministic Mock)
    const insights = [
      {
        type: "SUGGESTION" as const,
        message: "Consider breaking down 'Backend Implementation' into smaller tasks.",
        confidence: 0.95,
        relatedProjectId: job.data.context.projects[0]?.id,
      },
      {
        type: "INFO" as const,
        message: "Project velocity is stable.",
        confidence: 0.8,
      }
    ];

    // Save Results to DB
    for (const insight of insights) {
      await ProjectsService.saveInsight(job.id!, job.data.userId, insight);
    }

    return {
      version: "v1",
      insights,
      processedAt: new Date().toISOString(),
    };
  },
  {
    connection: connection as any,
    concurrency: 2,
  }
);

aiWorker.on("completed", (job) => {
  console.log(`[AI Worker] Job ${job.id} completed!`);
});

aiWorker.on("failed", (job, err) => {
  console.error(`[AI Worker] Job ${job?.id} failed: ${err.message}`);
});
