// Advanced circuit breaker and retry patterns
import { logger } from './logging';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open', 
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
      ...config,
    };
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen() && !this.shouldAttempt()) {
      throw new Error(`Circuit breaker ${this.name} is OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.state.state === CircuitState.OPEN;
  }

  private shouldAttempt(): boolean {
    return Date.now() >= this.state.nextAttemptTime;
  }

  private onSuccess(): void {
    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.successCount++;
      if (this.state.successCount >= this.config.halfOpenMaxCalls) {
        this.reset();
      }
    } else {
      this.state.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state.state = CircuitState.OPEN;
    this.state.nextAttemptTime = Date.now() + this.config.resetTimeout;
    logger.warn(`Circuit breaker ${this.name} tripped`, {
      failureCount: this.state.failureCount,
      state: this.state.state,
    }, ['circuit-breaker']);
  }

  private reset(): void {
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
    logger.info(`Circuit breaker ${this.name} reset`, {}, ['circuit-breaker']);
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Retry with exponential backoff
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: RegExp[];
}

export async function retryWithBackoff<T>(
  operation: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ENOTFOUND/,
      /5\d{2}/, // Server errors
    ],
    ...config,
  };

  let lastError: Error;
  let delay = retryConfig.initialDelay;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      const isRetryable = retryConfig.retryableErrors.some(pattern => 
        pattern.test(lastError.message)
      );

      if (!isRetryable || attempt === retryConfig.maxAttempts) {
        logger.error(`Retry failed for ${operation}`, lastError, {
          attempt,
          maxAttempts: retryConfig.maxAttempts,
        }, ['retry']);
        throw lastError;
      }

      logger.warn(`Retrying ${operation} (attempt ${attempt}/${retryConfig.maxAttempts})`, {
        delay,
        nextAttempt: attempt + 1,
      }, ['retry']);

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelay);
    }
  }

  throw lastError!;
}

// Fallback mechanisms
export class FallbackManager {
  private fallbacks = new Map<string, Array<{ priority: number; fn: () => any }>>();

  register(key: string, fallback: () => any, priority: number = 1): void {
    const existing = this.fallbacks.get(key) || [];
    existing.push({ priority, fn: fallback });
    existing.sort((a, b) => b.priority - a.priority); // Higher priority first
    this.fallbacks.set(key, existing);
  }

  async getFallback(key: string): Promise<any> {
    const fallbacks = this.fallbacks.get(key);
    if (!fallbacks || fallbacks.length === 0) {
      throw new Error(`No fallback available for ${key}`);
    }

    for (const fallback of fallbacks) {
      try {
        logger.info(`Attempting fallback for ${key}`, { priority: fallback.priority }, ['fallback']);
        const result = await fallback.fn();
        logger.info(`Fallback succeeded for ${key}`, { priority: fallback.priority }, ['fallback']);
        return result;
      } catch (error) {
        logger.warn(`Fallback failed for ${key}`, { 
          priority: fallback.priority, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, ['fallback']);
      }
    }

    throw new Error(`All fallbacks failed for ${key}`);
  }
}

// Bulkhead pattern - limit concurrent operations
export class Bulkhead {
  private semaphore: Promise<void>;
  private queue: Array<{ resolve: (value: void) => void; reject: (reason?: any) => void }> = [];
  private current: number = 0;
  private max: number;

  constructor(max: number) {
    this.max = max;
    this.semaphore = Promise.resolve();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for semaphore
    await this.semaphore;

    // Check if we can execute immediately
    if (this.current < this.max) {
      this.current++;
      return this._execute(fn);
    }

    // Add to queue
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve: resolve as any,
        reject,
      });
    });
  }

  private async _execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } finally {
      this._release();
    }
  }

  private _release(): void {
    this.current--;
    
    if (this.queue.length > 0 && this.current < this.max) {
      const next = this.queue.shift();
      if (next) {
        this.current++;
        next.resolve();
      }
    }
  }

  get currentUsage(): number {
    return this.current;
  }

  get queueLength(): number {
    return this.queue.length;
  }
}

// Timeout protection
export async function withTimeout<T>(
  operation: string,
  fn: () => Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation ${operation} timed out`)), timeout)
    ),
  ]);
}

// Cache-aside pattern with automatic refresh
export class CacheAside {
  private cache: Map<string, { value: any; expiry: number }>;
  private fetchers = new Map<string, () => Promise<any>>();

  constructor() {
    this.cache = new Map();
    
    // Cleanup expired entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry < now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Every minute
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expiry > Date.now()) {
      logger.debug(`Cache hit for ${key}`, {}, ['cache']);
      return cached.value;
    }

    logger.debug(`Cache miss for ${key}`, {}, ['cache']);
    
    try {
      const value = await fetcher();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      // Return stale data if available
      if (cached) {
        logger.warn(`Using stale cache for ${key}`, {}, ['cache']);
        return cached.value;
      }
      throw error;
    }
  }

  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  registerFetcher(key: string, fetcher: () => Promise<any>): void {
    this.fetchers.set(key, fetcher);
  }

  async refresh(key: string): Promise<void> {
    const fetcher = this.fetchers.get(key);
    if (fetcher) {
      const cached = this.cache.get(key);
      const ttl = cached ? (cached.expiry - Date.now()) : 300000;
      await this.get(key, fetcher, ttl);
    }
  }
}

// Health check and monitoring
export class HealthMonitor {
  private checks = new Map<string, () => Promise<boolean>>();
  private lastCheck = new Map<string, { success: boolean; timestamp: number }>();

  registerCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<{
    healthy: boolean;
    checks: Record<string, boolean>;
  }> {
    const results: Record<string, boolean> = {};
    let allHealthy = true;

    for (const [name, check] of this.checks.entries()) {
      try {
        const isHealthy = await check();
        results[name] = isHealthy;
        
        if (!isHealthy) {
          allHealthy = false;
          logger.warn(`Health check failed: ${name}`, {}, ['health']);
        }
      } catch (error) {
        results[name] = false;
        allHealthy = false;
        logger.error(`Health check error: ${name}`, error as Error, {}, ['health']);
      }
    }

    return {
      healthy: allHealthy,
      checks: results,
    };
  }

  getLastCheck(name: string): { success: boolean; timestamp: number } | undefined {
    return this.lastCheck.get(name);
  }
}