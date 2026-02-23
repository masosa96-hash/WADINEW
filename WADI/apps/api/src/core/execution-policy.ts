/**
 * WADI ExecutionPolicy — Phase 17: SAFE MODE
 *
 * Three execution modes control what WADI is allowed to do:
 *
 *   SAFE     → Staging. Preview only. Never touches cloud or remote git.
 *   STANDARD → Default. Gated deploy, full materialization.
 *   FULL     → Maximum autonomy. Explicit opt-in only.
 *
 * Controlled by WADI_MODE env var. Defaults to STANDARD.
 * The Brain never decides this. The operator does.
 */

export type ExecutionMode = "SAFE" | "STANDARD" | "FULL";

// ─── Mode Profiles ─────────────────────────────────────────────────────────────

const MODE_PROFILES: Record<ExecutionMode, ModeProfile> = {
  SAFE: {
    allowDeploy:        false,
    allowGitPush:       false,
    allowGitCommit:     false,
    maxFilesPerProject: 20,
    maxToolIterations:  5,
    maxTokensPerRun:    2_000,
    logPrefix:          "[PREVIEW]",
  },
  STANDARD: {
    allowDeploy:        false,   // Requires ENABLE_AUTODEPLOY=true on top
    allowGitPush:       false,
    allowGitCommit:     true,
    maxFilesPerProject: 50,
    maxToolIterations:  10,
    maxTokensPerRun:    4_000,
    logPrefix:          "",
  },
  FULL: {
    allowDeploy:        true,
    allowGitPush:       true,
    allowGitCommit:     true,
    maxFilesPerProject: 100,
    maxToolIterations:  20,
    maxTokensPerRun:    8_000,
    logPrefix:          "",
  },
};

interface ModeProfile {
  allowDeploy:        boolean;
  allowGitPush:       boolean;
  allowGitCommit:     boolean;
  maxFilesPerProject: number;
  maxToolIterations:  number;
  maxTokensPerRun:    number;
  logPrefix:          string;
}

// ─── Active Mode ───────────────────────────────────────────────────────────────

function resolveMode(): ExecutionMode {
  const raw = process.env.WADI_MODE?.toUpperCase();
  if (raw === "SAFE" || raw === "FULL") return raw;
  return "STANDARD";
}

const activeMode: ExecutionMode = resolveMode();
const activeProfile: ModeProfile = MODE_PROFILES[activeMode];

// ─── ExecutionPolicy  ──────────────────────────────────────────────────────────

export const ExecutionPolicy = {
  // ── Active mode (read-only at runtime) ──────────────────────────────────────
  mode: activeMode,

  // ── Derived from mode profile ────────────────────────────────────────────────
  /** Whether the current mode permits cloud deployment. Also requires ENABLE_AUTODEPLOY=true. */
  get enableAutoDeploy(): boolean {
    return activeProfile.allowDeploy && process.env.ENABLE_AUTODEPLOY === "true";
  },

  allowGitCommit:     activeProfile.allowGitCommit,
  allowGitPush:       activeProfile.allowGitPush,
  maxFilesPerProject: activeProfile.maxFilesPerProject,
  maxToolIterations:  activeProfile.maxToolIterations,
  maxTokensPerRun:    activeProfile.maxTokensPerRun,

  /** Prefix prepended to all structured log messages in SAFE mode. */
  logPrefix:          activeProfile.logPrefix,

  // ── Inherited fixed policy (independent of mode) ─────────────────────────────
  allowedProviders:        ["render", "vercel"] as const,
  blockDeployOnBuildError: true,
  deployOnBuildWarn:       true,
  allowedWritePaths:       ["e:\\WADINEW\\projects"],
  buildFailureMode:        "NON_BLOCKING" as "BLOCKING" | "NON_BLOCKING",
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

/** Returns true if the current mode is SAFE (preview/staging). */
export function isSafeMode(): boolean {
  return ExecutionPolicy.mode === "SAFE";
}

/** Returns the log prefix for SAFE mode context tagging. */
export function modeTag(): string {
  return ExecutionPolicy.logPrefix;
}
