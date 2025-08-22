/**
 * Circuit Breaker pattern implementation for Redis connections
 * Prevents cascading failures by monitoring error rates and temporarily
 * blocking requests when error threshold is exceeded
 */

export enum CircuitBreakerState {
  Closed = 'CLOSED', // Normal operation
  Open = 'OPEN', // Circuit is open, requests fail fast
  HalfOpen = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number // Number of failures before opening circuit
  recoveryTimeoutMs: number // Time to wait before attempting recovery
  monitoringTimeMs: number // Time window for monitoring failures
  halfOpenMaxCalls: number // Max calls allowed in half-open state
}

export interface CircuitBreakerMetrics {
  failureCount: number
  successCount: number
  totalCalls: number
  lastFailureTime: number
  state: CircuitBreakerState
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.Closed
  private failureCount = 0
  private successCount = 0
  private totalCalls = 0
  private lastFailureTime = 0
  private halfOpenCalls = 0
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      recoveryTimeoutMs: 60000, // 1 minute
      monitoringTimeMs: 300000, // 5 minutes
      halfOpenMaxCalls: 3,
      ...options,
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.Open) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HalfOpen
        this.halfOpenCalls = 0
      } else {
        throw new Error('Circuit breaker is OPEN - failing fast')
      }
    }

    if (
      this.state === CircuitBreakerState.HalfOpen &&
      this.halfOpenCalls >= this.options.halfOpenMaxCalls
    ) {
      throw new Error('Circuit breaker is HALF_OPEN - max calls exceeded')
    }

    try {
      this.totalCalls++
      if (this.state === CircuitBreakerState.HalfOpen) {
        this.halfOpenCalls++
      }

      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.successCount++
    if (this.state === CircuitBreakerState.HalfOpen) {
      // If we're in half-open and got success, reset to closed
      this.state = CircuitBreakerState.Closed
      this.reset()
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitBreakerState.HalfOpen) {
      // If we're testing and got failure, go back to open
      this.state = CircuitBreakerState.Open
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.Open
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.options.recoveryTimeoutMs
  }

  private reset(): void {
    this.failureCount = 0
    this.successCount = 0
    this.halfOpenCalls = 0
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      state: this.state,
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  // Force circuit open for testing or maintenance
  forceOpen(): void {
    this.state = CircuitBreakerState.Open
    this.lastFailureTime = Date.now()
  }

  // Force circuit closed for recovery
  forceClose(): void {
    this.state = CircuitBreakerState.Closed
    this.reset()
  }
}
