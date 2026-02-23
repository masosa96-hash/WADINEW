import { logger } from "../../core/logger";
import { ExecutionPolicy, isDeployAllowed } from "../../core/execution-policy";
import type { DeploymentResult } from "../../types/domain";

class DeployService {
  /**
   * Deploys a materialized project to a cloud provider.
   * Always checks ExecutionPolicy before executing.
   */
  async deploy(projectId: string, provider: "render" | "vercel" = "render"): Promise<DeploymentResult> {
    // Policy gate — must pass before any cloud call
    if (!isDeployAllowed(provider)) {
      logger.warn({ msg: "deploy_blocked_by_policy", projectId, provider, enableAutoDeploy: ExecutionPolicy.enableAutoDeploy });
      return {
        success: false,
        provider,
        error: "Deploy disabled by ExecutionPolicy. Set ENABLE_AUTODEPLOY=true to enable."
      };
    }

    logger.info({ msg: "deploy_start", projectId, provider });

    // Simulate network delay (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const url = `https://${projectId}.${provider}.app`;

    logger.info({ msg: "deploy_success", projectId, url });

    return {
      success: true,
      url,
      provider
    };
  }
}

export const deployService = new DeployService();
