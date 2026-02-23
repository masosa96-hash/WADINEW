/**
 * WADI Fault Injection Module — Phase 18
 *
 * Wraps providers with configurable failure scenarios.
 * Use in test environments to validate resilience.
 *
 * NEVER import this in production code paths.
 */

export type FaultType = "timeout" | "http_500" | "http_503" | "network_error";

export interface FaultConfig {
  provider: string;
  fault: FaultType;
  delayMs?: number;       // For timeout simulation
  probability?: number;   // 0.0–1.0, default 1.0 (always fail)
}

const activeFaults: Map<string, FaultConfig> = new Map();

/**
 * Register a fault for a named provider.
 * Subsequent calls to `maybeInjectFault(provider)` will throw accordingly.
 */
export function injectFault(config: FaultConfig): void {
  activeFaults.set(config.provider, config);
  console.log(`[FAULT_INJECTION] Registered fault for '${config.provider}': ${config.fault}`);
}

/**
 * Remove a registered fault.
 */
export function clearFault(provider: string): void {
  activeFaults.delete(provider);
}

/**
 * Clear all registered faults.
 */
export function clearAllFaults(): void {
  activeFaults.clear();
}

/**
 * Call this at the start of any provider function to simulate failure.
 * Throws if a fault is registered for this provider and probability fires.
 */
export async function maybeInjectFault(provider: string): Promise<void> {
  const config = activeFaults.get(provider);
  if (!config) return;

  const probability = config.probability ?? 1.0;
  if (Math.random() > probability) return; // Probabilistic: skip this time

  switch (config.fault) {
    case "timeout": {
      const delay = config.delayMs ?? 30_000;
      console.warn(`[FAULT_INJECTION] Simulating timeout for '${provider}' (${delay}ms)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      throw new Error(`Provider '${provider}' timed out after ${delay}ms`);
    }
    case "http_500":
      throw new Error(`Provider '${provider}' returned HTTP 500 Internal Server Error`);
    case "http_503":
      throw new Error(`Provider '${provider}' returned HTTP 503 Service Unavailable`);
    case "network_error":
      throw new Error(`Provider '${provider}' failed: ECONNREFUSED`);
    default:
      throw new Error(`Unknown fault type for '${provider}'`);
  }
}

/**
 * Convenience: wrap any async function with fault injection.
 */
export async function withFaultInjection<T>(
  provider: string,
  fn: () => Promise<T>
): Promise<T> {
  await maybeInjectFault(provider);
  return fn();
}
