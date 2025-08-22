import { brainEnvConfig } from '@netko/brain-config'
import { Redis, type RedisOptions } from 'ioredis'
import { CircuitBreaker, type CircuitBreakerState } from './circuit-breaker'

interface HealthCheck {
  isHealthy: boolean
  lastCheck: number
  errorCount: number
}

class RedisCacheClient {
  private static cacheInstance: Redis
  private static publisherInstance: Redis
  private static subscriberInstance: Redis
  private static circuitBreaker: CircuitBreaker
  private static healthCheck: HealthCheck = {
    isHealthy: true,
    lastCheck: Date.now(),
    errorCount: 0,
  }
  private static healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {}

  /**
   * Initialize circuit breaker for Redis operations
   */
  private static initializeCircuitBreaker(): void {
    if (!RedisCacheClient.circuitBreaker) {
      RedisCacheClient.circuitBreaker = new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeoutMs: 30000, // 30 seconds
        monitoringTimeMs: 60000, // 1 minute
        halfOpenMaxCalls: 3,
      })
    }
  }

  /**
   * Enhanced Redis options with proper error handling
   */
  private static getRedisOptions(): RedisOptions {
    return {
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      retryDelayOnClusterDown: 300,
    }
  }

  /**
   * Setup error handlers for Redis instance
   */
  private static setupErrorHandlers(redis: Redis, instanceName: string): void {
    redis.on('error', (error) => {
      console.error(`🔴 Redis ${instanceName} error:`, error)
      RedisCacheClient.healthCheck.isHealthy = false
      RedisCacheClient.healthCheck.errorCount++
      RedisCacheClient.healthCheck.lastCheck = Date.now()
    })

    redis.on('connect', () => {
      console.log(`🟢 Redis ${instanceName} connected`)
      RedisCacheClient.healthCheck.isHealthy = true
      RedisCacheClient.healthCheck.lastCheck = Date.now()
    })

    redis.on('ready', () => {
      console.log(`✅ Redis ${instanceName} ready`)
    })

    redis.on('close', () => {
      console.warn(`🟡 Redis ${instanceName} connection closed`)
      RedisCacheClient.healthCheck.isHealthy = false
    })

    redis.on('reconnecting', () => {
      console.log(`🔄 Redis ${instanceName} reconnecting...`)
    })
  }

  /**
   * Start health check monitoring
   */
  private static startHealthCheck(): void {
    if (RedisCacheClient.healthCheckInterval) return

    RedisCacheClient.healthCheckInterval = setInterval(async () => {
      try {
        // Use circuit breaker for health checks
        await RedisCacheClient.circuitBreaker.execute(async () => {
          const start = Date.now()
          await RedisCacheClient.getCache().ping()
          const latency = Date.now() - start

          RedisCacheClient.healthCheck.isHealthy = true
          RedisCacheClient.healthCheck.lastCheck = Date.now()

          // Log if latency is high
          if (latency > 1000) {
            console.warn(`⚠️ Redis high latency detected: ${latency}ms`)
          }
        })
      } catch (error) {
        console.error('🔴 Redis health check failed:', error)
        RedisCacheClient.healthCheck.isHealthy = false
        RedisCacheClient.healthCheck.errorCount++
        RedisCacheClient.healthCheck.lastCheck = Date.now()
      }
    }, 30000) // Check every 30 seconds
  }
  /**
   * Get the Redis cache instance (singleton)
   * Use this for caching operations: GET, SET, DEL, EXPIRE, etc.
   */
  public static getCache(): Redis {
    if (!RedisCacheClient.cacheInstance) {
      RedisCacheClient.initializeCircuitBreaker()
      RedisCacheClient.cacheInstance = new Redis(
        brainEnvConfig.cache.url,
        RedisCacheClient.getRedisOptions(),
      )
      RedisCacheClient.setupErrorHandlers(RedisCacheClient.cacheInstance, 'Cache')
      RedisCacheClient.startHealthCheck()
    }
    return RedisCacheClient.cacheInstance
  }

  /**
   * Get the Redis publisher instance (singleton)
   * Use this for publishing messages: PUBLISH
   */
  public static getPublisher(): Redis {
    if (!RedisCacheClient.publisherInstance) {
      RedisCacheClient.initializeCircuitBreaker()
      RedisCacheClient.publisherInstance = new Redis(
        brainEnvConfig.cache.url,
        RedisCacheClient.getRedisOptions(),
      )
      RedisCacheClient.setupErrorHandlers(RedisCacheClient.publisherInstance, 'Publisher')
    }
    return RedisCacheClient.publisherInstance
  }

  /**
   * Get the Redis subscriber instance (singleton)
   * Use this for subscribing to messages: SUBSCRIBE, PSUBSCRIBE
   */
  public static getSubscriber(): Redis {
    if (!RedisCacheClient.subscriberInstance) {
      RedisCacheClient.initializeCircuitBreaker()
      RedisCacheClient.subscriberInstance = new Redis(
        brainEnvConfig.cache.url,
        RedisCacheClient.getRedisOptions(),
      )
      RedisCacheClient.setupErrorHandlers(RedisCacheClient.subscriberInstance, 'Subscriber')
    }
    return RedisCacheClient.subscriberInstance
  }

  /**
   * Execute Redis operation with circuit breaker protection
   */
  public static async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    RedisCacheClient.initializeCircuitBreaker()
    return RedisCacheClient.circuitBreaker.execute(operation)
  }

  /**
   * Get current health status
   */
  public static getHealthStatus(): HealthCheck & { circuitBreakerState: CircuitBreakerState } {
    RedisCacheClient.initializeCircuitBreaker()
    return {
      ...RedisCacheClient.healthCheck,
      circuitBreakerState: RedisCacheClient.circuitBreaker.getState(),
    }
  }

  /**
   * Gracefully close all connections
   */
  public static async disconnect(): Promise<void> {
    // Stop health checks
    if (RedisCacheClient.healthCheckInterval) {
      clearInterval(RedisCacheClient.healthCheckInterval)
      RedisCacheClient.healthCheckInterval = null
    }

    // Close connections gracefully
    const promises: Promise<void>[] = []

    if (RedisCacheClient.cacheInstance) {
      promises.push(
        RedisCacheClient.cacheInstance
          .quit()
          .catch(() => RedisCacheClient.cacheInstance.disconnect()),
      )
    }

    if (RedisCacheClient.publisherInstance) {
      promises.push(
        RedisCacheClient.publisherInstance
          .quit()
          .catch(() => RedisCacheClient.publisherInstance.disconnect()),
      )
    }

    if (RedisCacheClient.subscriberInstance) {
      promises.push(
        RedisCacheClient.subscriberInstance
          .quit()
          .catch(() => RedisCacheClient.subscriberInstance.disconnect()),
      )
    }

    await Promise.all(promises)
    console.log('🔌 All Redis connections closed')
  }
}

// Export instances for specific use cases
export const redisCache = RedisCacheClient.getCache()
export const redisPublisher = RedisCacheClient.getPublisher()
export const redisSubscriber = RedisCacheClient.getSubscriber()

// Backwards compatibility
export const redisClient = redisCache

// Export the class for advanced usage
export { RedisCacheClient }
