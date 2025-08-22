/**
 * Application health monitoring and metrics collection
 * Provides comprehensive system health checks and performance monitoring
 */

export interface HealthMetrics {
  timestamp: string
  uptime: number
  memory: NodeJS.MemoryUsage
  cpu?: number
  redis?: {
    healthy: boolean
    latency?: number
    errorCount: number
    circuitBreakerState: string
  }
  database?: {
    healthy: boolean
    connectionCount?: number
    latency?: number
  }
  websockets?: {
    activeConnections: number
    totalConnections: number
    errors: number
  }
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  score: number // 0-100
  checks: Record<
    string,
    {
      status: 'pass' | 'warn' | 'fail'
      message?: string
      responseTime?: number
    }
  >
  metrics: HealthMetrics
}

class HealthMonitor {
  private static instance: HealthMonitor
  private healthChecks: Map<
    string,
    () => Promise<{ status: 'pass' | 'warn' | 'fail'; message?: string; responseTime?: number }>
  > = new Map()
  private metrics: HealthMetrics

  private constructor() {
    this.metrics = this.getBaseMetrics()
    this.registerDefaultChecks()
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  private getBaseMetrics(): HealthMetrics {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }
  }

  private registerDefaultChecks() {
    // Memory usage check
    this.registerHealthCheck('memory', async () => {
      const memUsage = process.memoryUsage()
      const usedMemoryMB = memUsage.heapUsed / 1024 / 1024
      const maxMemoryMB = memUsage.heapTotal / 1024 / 1024
      const memoryUsagePercent = (usedMemoryMB / maxMemoryMB) * 100

      if (memoryUsagePercent > 90) {
        return {
          status: 'fail',
          message: `Memory usage critically high: ${memoryUsagePercent.toFixed(1)}%`,
        }
      }
      if (memoryUsagePercent > 75) {
        return { status: 'warn', message: `Memory usage high: ${memoryUsagePercent.toFixed(1)}%` }
      }

      return { status: 'pass', message: `Memory usage normal: ${memoryUsagePercent.toFixed(1)}%` }
    })

    // Event loop lag check
    this.registerHealthCheck('eventLoop', async () => {
      const start = process.hrtime.bigint()
      await new Promise((resolve) => setImmediate(resolve))
      const lag = Number(process.hrtime.bigint() - start) / 1e6 // Convert to milliseconds

      if (lag > 100) {
        return {
          status: 'fail',
          message: `Event loop lag critical: ${lag.toFixed(2)}ms`,
          responseTime: lag,
        }
      }
      if (lag > 50) {
        return {
          status: 'warn',
          message: `Event loop lag high: ${lag.toFixed(2)}ms`,
          responseTime: lag,
        }
      }

      return {
        status: 'pass',
        message: `Event loop responsive: ${lag.toFixed(2)}ms`,
        responseTime: lag,
      }
    })
  }

  registerHealthCheck(
    name: string,
    check: () => Promise<{
      status: 'pass' | 'warn' | 'fail'
      message?: string
      responseTime?: number
    }>,
  ) {
    this.healthChecks.set(name, check)
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: Record<
      string,
      { status: 'pass' | 'warn' | 'fail'; message?: string; responseTime?: number }
    > = {}
    let passCount = 0
    let warnCount = 0
    let failCount = 0

    // Execute all health checks in parallel
    const checkPromises = Array.from(this.healthChecks.entries()).map(async ([name, check]) => {
      try {
        const result = await Promise.race([
          check(),
          new Promise<{ status: 'fail'; message: string }>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), 5000),
          ),
        ])
        checks[name] = result

        switch (result.status) {
          case 'pass':
            passCount++
            break
          case 'warn':
            warnCount++
            break
          case 'fail':
            failCount++
            break
        }
      } catch (error) {
        checks[name] = {
          status: 'fail',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
        failCount++
      }
    })

    await Promise.all(checkPromises)

    // Calculate health score
    const totalChecks = this.healthChecks.size
    const score = Math.round(((passCount + warnCount * 0.5) / totalChecks) * 100)

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (failCount === 0 && warnCount <= 1) {
      status = 'healthy'
    } else if (failCount === 0 || (failCount === 1 && totalChecks > 3)) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    // Update metrics
    this.metrics = {
      ...this.getBaseMetrics(),
      ...this.metrics, // Preserve additional metrics from other systems
    }

    return {
      status,
      score,
      checks,
      metrics: this.metrics,
    }
  }

  updateMetrics(updates: Partial<HealthMetrics>) {
    this.metrics = {
      ...this.metrics,
      ...updates,
      timestamp: new Date().toISOString(),
    }
  }

  getMetrics(): HealthMetrics {
    return { ...this.metrics, timestamp: new Date().toISOString() }
  }

  // Register Redis health check
  registerRedisHealthCheck(
    getRedisHealth: () => Promise<{
      isHealthy: boolean
      errorCount: number
      circuitBreakerState: string
    }>,
  ) {
    this.registerHealthCheck('redis', async () => {
      const start = Date.now()
      try {
        const redisHealth = await getRedisHealth()
        const responseTime = Date.now() - start

        this.updateMetrics({
          redis: {
            healthy: redisHealth.isHealthy,
            latency: responseTime,
            errorCount: redisHealth.errorCount,
            circuitBreakerState: redisHealth.circuitBreakerState,
          },
        })

        if (!redisHealth.isHealthy) {
          return {
            status: 'fail',
            message: `Redis unhealthy (errors: ${redisHealth.errorCount}, circuit: ${redisHealth.circuitBreakerState})`,
            responseTime,
          }
        }
        if (responseTime > 1000) {
          return { status: 'warn', message: `Redis slow response: ${responseTime}ms`, responseTime }
        }

        return { status: 'pass', message: `Redis healthy (${responseTime}ms)`, responseTime }
      } catch (error) {
        const responseTime = Date.now() - start
        return {
          status: 'fail',
          message: `Redis check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime,
        }
      }
    })
  }

  // Register database health check
  registerDatabaseHealthCheck(
    checkDatabase: () => Promise<{ healthy: boolean; connectionCount?: number }>,
  ) {
    this.registerHealthCheck('database', async () => {
      const start = Date.now()
      try {
        const dbHealth = await checkDatabase()
        const responseTime = Date.now() - start

        this.updateMetrics({
          database: {
            healthy: dbHealth.healthy,
            connectionCount: dbHealth.connectionCount,
            latency: responseTime,
          },
        })

        if (!dbHealth.healthy) {
          return { status: 'fail', message: 'Database connection failed', responseTime }
        }
        if (responseTime > 2000) {
          return {
            status: 'warn',
            message: `Database slow response: ${responseTime}ms`,
            responseTime,
          }
        }

        return { status: 'pass', message: `Database healthy (${responseTime}ms)`, responseTime }
      } catch (error) {
        const responseTime = Date.now() - start
        return {
          status: 'fail',
          message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime,
        }
      }
    })
  }

  // Update WebSocket metrics
  updateWebSocketMetrics(activeConnections: number, totalConnections: number, errors: number) {
    this.updateMetrics({
      websockets: {
        activeConnections,
        totalConnections,
        errors,
      },
    })
  }
}

export const healthMonitor = HealthMonitor.getInstance()

// Performance monitoring utilities
export class PerformanceTracker {
  private static measurements: Map<string, { start: number; samples: number[] }> = new Map()

  static startMeasurement(label: string): void {
    PerformanceTracker.measurements.set(label, {
      start: performance.now(),
      samples: PerformanceTracker.measurements.get(label)?.samples || [],
    })
  }

  static endMeasurement(label: string): number | null {
    const measurement = PerformanceTracker.measurements.get(label)
    if (!measurement) return null

    const duration = performance.now() - measurement.start
    measurement.samples.push(duration)

    // Keep only last 100 samples to prevent memory leak
    if (measurement.samples.length > 100) {
      measurement.samples = measurement.samples.slice(-100)
    }

    return duration
  }

  static getAverageTime(label: string): number | null {
    const measurement = PerformanceTracker.measurements.get(label)
    if (!measurement || measurement.samples.length === 0) return null

    return measurement.samples.reduce((sum, time) => sum + time, 0) / measurement.samples.length
  }

  static getPercentile(label: string, percentile: number): number | null {
    const measurement = PerformanceTracker.measurements.get(label)
    if (!measurement || measurement.samples.length === 0) return null

    const sorted = [...measurement.samples].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  static getMetrics(label: string) {
    const measurement = PerformanceTracker.measurements.get(label)
    if (!measurement || measurement.samples.length === 0) return null

    return {
      count: measurement.samples.length,
      average: PerformanceTracker.getAverageTime(label),
      p50: PerformanceTracker.getPercentile(label, 50),
      p95: PerformanceTracker.getPercentile(label, 95),
      p99: PerformanceTracker.getPercentile(label, 99),
      min: Math.min(...measurement.samples),
      max: Math.max(...measurement.samples),
    }
  }
}

// Express/Hono middleware for performance tracking
export function performanceMiddleware(label: string) {
  return (req: any, res: any, next: any) => {
    PerformanceTracker.startMeasurement(label)

    const originalEnd = res.end
    res.end = function (...args: any[]) {
      PerformanceTracker.endMeasurement(label)
      return originalEnd.apply(this, args)
    }

    if (next) next()
  }
}
