// Simple in-memory cache with TTL
class Cache<T> {
  private cache = new Map<string, { value: T; expires: number }>();

  set(key: string, value: T, ttlMs = 300000): void { // 5 min default
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const mappingsCache = new Cache<unknown>();
export const issuesCache = new Cache<unknown>();

// Auto cleanup every 10 minutes
setInterval(() => {
  mappingsCache.cleanup();
  issuesCache.cleanup();
}, 600000);
