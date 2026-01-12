import { ProjectDTO } from "./projects";

export type AIJobType = "SUGGEST_NEXT_ACTIONS" | "SUMMARIZE_PROJECTS" | "ANALYZE_FRICTION";

export interface AIJobInput {
  version: "v1";
  userId: string;
  context: {
    projects: ProjectDTO[]; // Using strongly typed ProjectDTO
    recentActivity: {
      type: string;
      content: string;
      timestamp: string;
    }[];
  };
  goal: AIJobType;
}

export interface AIInsight {
  type: "SUGGESTION" | "WARNING" | "INFO";
  message: string;
  relatedProjectId?: string;
  confidence: number; // 0.0 a 1.0
}

export interface AIJobOutput {
  version: "v1";
  insights: AIInsight[];
  summary?: string;
  processedAt: string;
}
