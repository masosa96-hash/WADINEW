/**
 * WADI Internal Event Bus — Phase 15B
 *
 * Typed publish/subscribe bus for decoupling WADI's three layers:
 *   Core Cognitive  ──emit──▶ Engine (materializer, tools)
 *   Engine          ──emit──▶ Infra  (deploy, metrics)
 *
 * Rules:
 *   - Core does NOT import Engine or Infra directly.
 *   - Engine does NOT import Core prompts or user context.
 *   - Events are the ONLY bridge between layers.
 */

import { EventEmitter } from "events";
import type { ProjectStructure, BuildResult, DeploymentResult, FeatureRequest } from "../types/domain";

// ─── Event Catalog ────────────────────────────────────────────────────────────

export interface WadiEvents {
  // Emitted by Core when an idea is crystallized and ready to build
  PROJECT_CRYSTALLIZED: {
    projectId: string;
    correlationId: string;
    structure: ProjectStructure;
  };

  // Emitted by Engine when scaffolding is complete
  SCAFFOLDING_COMPLETE: {
    projectId: string;
    correlationId: string;
    templateId?: string;
  };

  // Emitted by Engine when each feature finishes implementation
  FEATURE_IMPLEMENTED: {
    projectId: string;
    correlationId: string;
    featureId: string;
    params?: Record<string, string>;
  };

  // Emitted by Engine when file writing is done
  FILES_WRITTEN: {
    projectId: string;
    correlationId: string;
    filesCreated: number;
  };

  // Emitted by Engine after build verification
  BUILD_VERIFIED: {
    projectId: string;
    correlationId: string;
    result: BuildResult;
  };

  // Emitted by Engine when materialization finishes (success or fail)
  MATERIALIZATION_COMPLETE: {
    projectId: string;
    correlationId: string;
    success: boolean;
    filesCreated: number;
    deployUrl?: string;
  };

  // Emitted by Infra when a deployment completes
  DEPLOYMENT_COMPLETE: {
    projectId: string;
    correlationId: string;
    result: DeploymentResult;
  };

  // Emitted by Engine/Infra when a run fails
  RUN_FAILED: {
    projectId: string;
    correlationId: string;
    step: string;
    error: string;
  };
}

// ─── Typed Bus ────────────────────────────────────────────────────────────────

class WadiEventBus extends EventEmitter {
  emit<K extends keyof WadiEvents>(event: K, payload: WadiEvents[K]): boolean {
    return super.emit(event, payload);
  }

  on<K extends keyof WadiEvents>(event: K, listener: (payload: WadiEvents[K]) => void): this {
    return super.on(event, listener);
  }

  once<K extends keyof WadiEvents>(event: K, listener: (payload: WadiEvents[K]) => void): this {
    return super.once(event, listener);
  }

  off<K extends keyof WadiEvents>(event: K, listener: (payload: WadiEvents[K]) => void): this {
    return super.off(event, listener);
  }
}

export const eventBus = new WadiEventBus();

// Unlimited listeners: each layer subscribes independently
eventBus.setMaxListeners(50);
