/**
 * WADI ExecutionPolicy — Phase 15A
 *
 * Single authority for all operational limits and feature flags.
 * The Brain proposes. The Policy permits.
 *
 * NEVER let an LLM output override these values.
 */

export const ExecutionPolicy = {
  // ─── Deploy Gate ────────────────────────────────────────────────────────────
  /** Master switch: cloud deploy is OFF by default. Set ENABLE_AUTODEPLOY=true in .env to activate. */
  enableAutoDeploy: process.env.ENABLE_AUTODEPLOY === "true",

  /** Allowed cloud providers. Any other value is rejected at the service layer. */
  allowedProviders: ["render", "vercel"] as const,

  // ─── Material Limits ────────────────────────────────────────────────────────
  /** Max files a single project materialization can produce. */
  maxFilesPerProject: 50,

  /** Max LLM tool iterations per Brain session. Prevents runaway planning loops. */
  maxToolIterations: 10,

  /** Max tokens the Brain can use per crystallization request. */
  maxTokensPerCrystallization: 4000,

  // ─── Execution Permissions ──────────────────────────────────────────────────
  /** Whether git commit is allowed during materialization. */
  allowGitCommit: true,

  /** Filesystem roots the execution engine may write to. Anything outside is rejected. */
  allowedWritePaths: ["e:\\WADINEW\\projects"],

  // ─── Build Policy ───────────────────────────────────────────────────────────
  /**
   * BLOCKING: build errors abort the deploy (not the scaffold).
   * NON_BLOCKING: log warning, continue.
   */
  buildFailureMode: "NON_BLOCKING" as "BLOCKING" | "NON_BLOCKING",

  /** If true, a WARN-level build result still allows deployment. */
  deployOnBuildWarn: true,

  /** If true, abort deploy when build status is ERROR. Always true in safe mode. */
  blockDeployOnBuildError: true,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isDeployAllowed(provider: string): boolean {
  if (!ExecutionPolicy.enableAutoDeploy) return false;
  return (ExecutionPolicy.allowedProviders as readonly string[]).includes(provider);
}

export function isPathAllowed(absolutePath: string): boolean {
  return ExecutionPolicy.allowedWritePaths.some(root =>
    absolutePath.startsWith(root)
  );
}
