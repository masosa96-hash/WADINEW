import { logger } from "../core/logger";

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;

  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly name: string;
  private readonly transitionCallback?: (name: string, from: CircuitState, to: CircuitState) => void;

  constructor(
    name: string,
    options: {
      failureThreshold?: number;
      successThreshold?: number;
      recoveryTimeout?: number;
      onTransition?: (name: string, from: CircuitState, to: CircuitState) => void;
    } = {}
  ) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.recoveryTimeout = options.recoveryTimeout || 30000; // 30 seconds
    this.transitionCallback = options.onTransition;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new Error(`Circuit Breaker [${this.name}] is OPEN`);
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private transitionTo(newState: CircuitState) {
    const oldState = this.state;
    logger.warn({
      msg: "circuit_breaker_transition",
      name: this.name,
      from: oldState,
      to: newState,
    }, `Circuit Breaker [${this.name}] transitioned from ${oldState} to ${newState}`);
    
    this.state = newState;
    this.failureCount = 0;
    this.successCount = 0;

    if (this.transitionCallback) {
      this.transitionCallback(this.name, oldState, newState);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
