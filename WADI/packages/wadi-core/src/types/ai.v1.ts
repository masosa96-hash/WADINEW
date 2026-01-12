import { ProjectDTO } from "./projects";

export type AIJobGoal = "SUGGEST_NEXT_ACTIONS" | "SUMMARIZE_PROJECTS";

export interface AIJobInputV1 {
  version: "v1";
  userId: string;
  context: {
    projects: ProjectDTO[];
    recentActivity: {
      type: "PROJECT_CREATED" | "PROJECT_UPDATED" | "NOTE_ADDED";
      entityId: string;
      timestamp: string;
    }[];
  };
  goal: AIJobGoal;
}

export type AIInsightType = "SUGGESTION" | "WARNING";

export interface AIInsight {
  type: AIInsightType;
  message: string;
  relatedProjectId?: string;
  confidence: number; // 0..1
}

export interface AIJobOutputV1 {
  version: "v1";
  insights: AIInsight[];
  summary?: string;
  meta?: {
    durationMs: number;
    modelUsed?: string;
  };
}
