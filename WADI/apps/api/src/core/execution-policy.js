"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPolicy = void 0;
exports.isDeployAllowed = isDeployAllowed;
exports.isPathAllowed = isPathAllowed;
exports.isSafeMode = isSafeMode;
exports.modeTag = modeTag;
// ─── Mode Profiles ─────────────────────────────────────────────────────────────
var MODE_PROFILES = {
    SAFE: {
        allowDeploy: false,
        allowGitPush: false,
        allowGitCommit: false,
        maxFilesPerProject: 20,
        maxToolIterations: 5,
        maxTokensPerRun: 2000,
        logPrefix: "[PREVIEW]",
    },
    STANDARD: {
        allowDeploy: false, // Requires ENABLE_AUTODEPLOY=true on top
        allowGitPush: false,
        allowGitCommit: true,
        maxFilesPerProject: 50,
        maxToolIterations: 10,
        maxTokensPerRun: 4000,
        logPrefix: "",
    },
    FULL: {
        allowDeploy: true,
        allowGitPush: true,
        allowGitCommit: true,
        maxFilesPerProject: 100,
        maxToolIterations: 20,
        maxTokensPerRun: 8000,
        logPrefix: "",
    },
};
// ─── Active Mode ───────────────────────────────────────────────────────────────
function resolveMode() {
    var _a;
    var raw = (_a = process.env.WADI_MODE) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    if (raw === "SAFE" || raw === "FULL")
        return raw;
    return "STANDARD";
}
var activeMode = resolveMode();
var activeProfile = MODE_PROFILES[activeMode];
// ─── ExecutionPolicy  ──────────────────────────────────────────────────────────
exports.ExecutionPolicy = {
    // ── Active mode (read-only at runtime) ──────────────────────────────────────
    mode: activeMode,
    // ── Derived from mode profile ────────────────────────────────────────────────
    /** Whether the current mode permits cloud deployment. Also requires ENABLE_AUTODEPLOY=true. */
    get enableAutoDeploy() {
        return activeProfile.allowDeploy && process.env.ENABLE_AUTODEPLOY === "true";
    },
    allowGitCommit: activeProfile.allowGitCommit,
    allowGitPush: activeProfile.allowGitPush,
    maxFilesPerProject: activeProfile.maxFilesPerProject,
    maxToolIterations: activeProfile.maxToolIterations,
    maxTokensPerRun: activeProfile.maxTokensPerRun,
    /** Prefix prepended to all structured log messages in SAFE mode. */
    logPrefix: activeProfile.logPrefix,
    // ── Inherited fixed policy (independent of mode) ─────────────────────────────
    allowedProviders: ["render", "vercel"],
    blockDeployOnBuildError: true,
    deployOnBuildWarn: true,
    allowedWritePaths: ["e:\\WADINEW\\projects"],
    buildFailureMode: "NON_BLOCKING",
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
function isDeployAllowed(provider) {
    if (!exports.ExecutionPolicy.enableAutoDeploy)
        return false;
    return exports.ExecutionPolicy.allowedProviders.includes(provider);
}
function isPathAllowed(absolutePath) {
    return exports.ExecutionPolicy.allowedWritePaths.some(function (root) {
        return absolutePath.startsWith(root);
    });
}
/** Returns true if the current mode is SAFE (preview/staging). */
function isSafeMode() {
    return exports.ExecutionPolicy.mode === "SAFE";
}
/** Returns the log prefix for SAFE mode context tagging. */
function modeTag() {
    return exports.ExecutionPolicy.logPrefix;
}
