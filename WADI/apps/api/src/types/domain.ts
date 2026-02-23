/**
 * WADI Domain Types — Phase 15A
 * Single source of truth for all core entities.
 * NO `any` allowed beyond this file boundary.
 */

// ─── Feature ─────────────────────────────────────────────────────────────────

export interface FeatureRequest {
  id: string;
  params?: Record<string, string>;
}

export interface ProjectFile {
  path: string;
  content: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface ProjectStructure {
  name: string;
  description?: string;
  templateId?: string;
  features?: FeatureRequest[];
  files?: ProjectFile[];
  shouldDeploy?: boolean;
  deployProvider?: "render" | "vercel";
}

export interface Project {
  id: string;
  name: string;
  structure: ProjectStructure;
  userId?: string;
}

// ─── Execution ────────────────────────────────────────────────────────────────

export interface Run {
  id: string | null;
  projectId: string;
  stepName: string;
  correlationId: string;
}

export type RunStatus = "IN_PROGRESS" | "SUCCESS" | "FAILED" | "PREVIEW";

export interface RunLogs {
  filesCreated?: number;
  templateId?: string;
  features?: FeatureRequest[];
  deployUrl?: string;
  blueprint?: string[];
  [key: string]: unknown;
}

// ─── Blueprint ────────────────────────────────────────────────────────────────

export interface BlueprintResult {
  success: boolean;
  filesCreated: number;
  blueprint?: ProjectFile[];
  deployUrl?: string;
  correlationId?: string;
}

// ─── Build ────────────────────────────────────────────────────────────────────

export type BuildStatus = "OK" | "WARN" | "ERROR" | "RISK";

export interface BuildResult {
  status: BuildStatus;
  reason?: "dependencies_missing" | "typescript_errors" | "tests_failed";
  details?: string;
  output?: string;
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export interface DeploymentResult {
  success: boolean;
  url?: string;
  provider: "render" | "vercel";
  error?: string;
  degraded?: boolean;
}
