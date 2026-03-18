import Redis from 'ioredis';

/**
 * Singleton Redis-backed cache service.
 * Falls back to in-memory cache when Redis is unavailable (e.g., local dev without Docker).
 */
class CacheService {
    private static instance: CacheService;
    private redis: Redis | null = null;
    private memoryFallback = new Map<string, { value: string; expiresAt: number }>();
    private initialized = false;

    private constructor() {}

    static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    private ensureConnection(): void {
        if (this.initialized) return;
        this.initialized = true;

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl || typeof window !== 'undefined') {
            console.warn('[Cache] No REDIS_URL configured, using in-memory fallback');
            return;
        }

        try {
            this.redis = new Redis(redisUrl, {
                maxRetriesPerRequest: 2,
                lazyConnect: true,
                connectTimeout: 3000,
                retryStrategy: (times) => {
                    if (times > 3) return null; // stop retrying
                    return Math.min(times * 200, 1000);
                },
            });

            this.redis.on('error', (err) => {
                console.error('[Cache][Redis] Connection error:', err.message);
            });

            this.redis.connect().catch(() => {
                console.warn('[Cache] Redis connect failed, using in-memory fallback');
                this.redis = null;
            });
        } catch {
            console.warn('[Cache] Redis init failed, using in-memory fallback');
            this.redis = null;
        }
    }

    /**
     * Get a value from cache. Returns null if not found or expired.
     */
    async get<T>(key: string): Promise<T | null> {
        this.ensureConnection();

        try {
            if (this.redis) {
                const raw = await this.redis.get(key);
                if (!raw) return null;

                try {
                    return JSON.parse(raw) as T;
                } catch {
                    return raw as T;
                }
            }

            // Memory fallback
            const entry = this.memoryFallback.get(key);
            if (!entry) return null;
            if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
                this.memoryFallback.delete(key);
                return null;
            }

            try {
                return JSON.parse(entry.value) as T;
            } catch {
                return entry.value as T;
            }
        } catch (err) {
            console.error(`[Cache] GET error for key "${key}":`, err);
            return null;
        }
    }

    /**
     * Set a value in cache with optional TTL (in seconds).
     */
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        this.ensureConnection();
        const serialized = JSON.stringify(value);

        try {
            if (this.redis) {
                if (ttlSeconds && ttlSeconds > 0) {
                    await this.redis.set(key, serialized, 'EX', ttlSeconds);
                } else {
                    await this.redis.set(key, serialized);
                }
                return;
            }

            // Memory fallback
            this.memoryFallback.set(key, {
                value: serialized,
                expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
            });
        } catch (err) {
            console.error(`[Cache] SET error for key "${key}":`, err);
        }
    }

    /**
     * Delete a key from cache.
     */
    async del(key: string): Promise<void> {
        this.ensureConnection();

        try {
            if (this.redis) {
                await this.redis.del(key);
                return;
            }
            this.memoryFallback.delete(key);
        } catch (err) {
            console.error(`[Cache] DEL error for key "${key}":`, err);
        }
    }

    /**
     * Increment a numeric value. Returns the new value.
     */
    async incr(key: string): Promise<number> {
        this.ensureConnection();

        try {
            if (this.redis) {
                return await this.redis.incr(key);
            }

            // Memory fallback
            const entry = this.memoryFallback.get(key);
            const current = entry ? parseInt(entry.value, 10) || 0 : 0;
            const next = current + 1;
            this.memoryFallback.set(key, {
                value: String(next),
                expiresAt: entry?.expiresAt ?? 0,
            });
            return next;
        } catch (err) {
            console.error(`[Cache] INCR error for key "${key}":`, err);
            return 0;
        }
    }

    /**
     * Check if a key exists.
     */
    async exists(key: string): Promise<boolean> {
        this.ensureConnection();

        try {
            if (this.redis) {
                return (await this.redis.exists(key)) === 1;
            }

            const entry = this.memoryFallback.get(key);
            if (!entry) return false;
            if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
                this.memoryFallback.delete(key);
                return false;
            }
            return true;
        } catch (err) {
            console.error(`[Cache] EXISTS error for key "${key}":`, err);
            return false;
        }
    }
}

/** Singleton cache instance */
export const cache = CacheService.getInstance();
