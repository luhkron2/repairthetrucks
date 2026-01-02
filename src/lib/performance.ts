// Advanced caching and performance optimization utilities
// Using simple Map as fallback for type safety - can be enhanced with LRUCache later

// Type-safe cache wrapper
export class TypedCache<K, V> {
  private cache: Map<string, { value: V; expiry: number }>;
  private maxSize: number;
  private keyPrefix: string;
  private ttl: number | undefined;

  constructor(options: {
    maxSize: number;
    ttl?: number; // milliseconds
    keyPrefix?: string;
  }) {
    this.cache = new Map();
    this.maxSize = options.maxSize;
    this.keyPrefix = options.keyPrefix || '';
    this.ttl = options.ttl;
  }

  private serializeKey(key: K): string {
    return `${this.keyPrefix}:${JSON.stringify(key)}`;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(this.serializeKey(key));
    if (!entry) return undefined;

    if (this.ttl && entry.expiry < Date.now()) {
      this.cache.delete(this.serializeKey(key));
      return undefined;
    }

    return entry.value;
  }

  set(key: K, value: V, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      // Simple FIFO eviction when full
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(this.serializeKey(key), {
      value,
      expiry: Date.now() + (ttl || this.ttl || 0),
    });
  }

  delete(key: K): boolean {
    return this.cache.delete(this.serializeKey(key));
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.cache.has(this.serializeKey(key));
  }

  size(): number {
    return this.cache.size;
  }

  // Advanced operations
  async getOrSet(
    key: K, 
    fetcher: () => Promise<V>, 
    ttl?: number
  ): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  // Batch operations
  getMany(keys: K[]): Map<K, V> {
    const result = new Map<K, V>();
    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    return result;
  }

  setMany(entries: Array<[K, V]>, ttl?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl);
    }
  }
}

// Pre-configured cache instances
export const cacheInstances = {
  userCache: new TypedCache<string, any>({
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    keyPrefix: 'user',
  }),
  
  issueCache: new TypedCache<string, any>({
    maxSize: 500,
    ttl: 2 * 60 * 1000, // 2 minutes
    keyPrefix: 'issue',
  }),
  
  mappingCache: new TypedCache<string, any>({
    maxSize: 2000,
    ttl: 30 * 60 * 1000, // 30 minutes
    keyPrefix: 'mapping',
  }),
  
  apiCache: new TypedCache<string, any>({
    maxSize: 100,
    ttl: 60 * 1000, // 1 minute
    keyPrefix: 'api',
  }),
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }
    
    const duration = performance.now() - start;
    this.timers.delete(label);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static async measure<T>(label: string, operation: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static measureSync<T>(label: string, operation: () => T): T {
    this.start(label);
    try {
      const result = operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

// Debounce utility for search/filter operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for API calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization helper
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  cache?: TypedCache<string, ReturnType<T>>
): T {
  const memoCache = cache || new TypedCache<string, ReturnType<T>>({ maxSize: 100 });
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = memoCache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = func(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
}