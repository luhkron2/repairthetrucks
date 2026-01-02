declare module 'lru-cache' {
  interface Options<K, V> {
    max?: number;
    ttl?: number;
    allowStale?: boolean;
    updateAgeOnGet?: boolean;
  }

  interface LRUCache<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V, options?: { ttl?: number }): void;
    delete(key: K): boolean;
    clear(): void;
    has(key: K): boolean;
    size: number;
  }

  function LRUCache<K, V>(options: Options<K, V>): LRUCache<K, V>;
  export = LRUCache;
}