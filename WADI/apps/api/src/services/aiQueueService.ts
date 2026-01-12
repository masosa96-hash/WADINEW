import { aiQueue } from "../queue/aiQueue";
import { AIJobInput, AIJobType, ProjectDTO } from "@wadi/core";

export class AIQueueService {
  /**
   * Dispatch a new AI job to the queue
   */
  static async dispatch(
    userId: string,
    goal: AIJobType,
    context: {
      projects: ProjectDTO[];
      recentActivity: any[]; // refine type if needed
    }
  ) {
    const jobInput: AIJobInput = {
      version: "v1",
      userId,
      context,
      goal,
    };

    const job = await aiQueue.add(goal, jobInput);
    
    return {
      jobId: job.id,
      name: job.name,
      timestamp: job.timestamp,
    };
  }
}
