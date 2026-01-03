import { config } from '@/config';

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

export class KV {
    private readonly memoryCache = new Map<string, CacheEntry<any>>();

    private getBaseURL(namespaceId: string): string | null {
        if (!config.CLOUDFLARE.KV.ACCOUNT_ID || !namespaceId) {
            return null;
        }
        return `https://api.cloudflare.com/client/v4/accounts/${config.CLOUDFLARE.KV.ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/values`;
    }

    private getMemoryKey(namespaceId: string, key: string): string {
        return `${namespaceId}:${key}`;
    }

    private setMemoryCache<T>(namespaceId: string, key: string, value: T, ttl: number = config.CACHE.DEFAULT_TTL): void {
        const cacheKey = this.getMemoryKey(namespaceId, key);
        this.memoryCache.set(cacheKey, {
            value,
            timestamp: Date.now(),
            ttl
        });
        console.log('[KV][Memory] Set:', cacheKey);
    }

    async getKey<T>(namespaceId: string, key: string): Promise<T | null> {
        const cacheKey = this.getMemoryKey(namespaceId, key);
        const cached = this.memoryCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp <= cached.ttl) {
            return cached.value;
        }

        this.memoryCache.delete(cacheKey);

        try {
            const baseUrl = this.getBaseURL(namespaceId);
            if (!baseUrl) {
                console.warn('[KV] Missing Cloudflare configuration, skipping fetch');
                return null;
            }

            const res = await fetch(`${baseUrl}/${encodeURIComponent(key)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${config.CLOUDFLARE.KV.API_TOKEN}`
                }
            });

            if (!res.ok) {
                console.warn(`[KV][Fetch Fail] ${key}: ${res.status} ${res.statusText}`);
                return null;
            }

            const raw = await res.text();

            try {
                const parsed = JSON.parse(raw);
                this.setMemoryCache(namespaceId, key, parsed);
                return parsed;
            } catch (parseErr) {
                const error = parseErr instanceof Error ? parseErr.message : 'Unknown parsing error';
                console.warn(`[KV][Parse Fail] Invalid JSON for key ${key}: ${error}`, raw);
                return null;
            }

        } catch (err) {
            console.error(`[KV][Network Error] Failed to fetch key ${key}:`, err);
            return null;
        }
    }

    async putKey<T>(namespaceId: string, key: string, value: T, ttl?: number): Promise<void> {
        this.setMemoryCache(namespaceId, key, value, ttl);

        try {
            const baseUrl = this.getBaseURL(namespaceId);
            if (!baseUrl) {
                console.warn('[KV] Missing Cloudflare configuration, skipping put');
                return;
            }

            const url = new URL(`${baseUrl}/${encodeURIComponent(key)}`);

            if (ttl) {
                url.searchParams.set('expiration_ttl', ttl.toString());
            }

            const formData = new FormData();
            formData.append('metadata', JSON.stringify({ cached: true }));
            formData.append('value', JSON.stringify(value));

            const res = await fetch(url.toString(), {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${config.CLOUDFLARE.KV.API_TOKEN}`
                },
                body: formData
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`[KV][PUT Fail] ${key}: ${res.status} ${res.statusText} - ${errText}`);
            }
        } catch (err) {
            console.error(`[KV][PUT Error] Failed to store key ${key}:`, err);
            throw err;
        }
    }

    deleteMemoryKey(namespaceId: string, key: string): void {
        const cacheKey = this.getMemoryKey(namespaceId, key);
        const existed = this.memoryCache.delete(cacheKey);
        if (existed) {
            console.log('[KV][Memory] Deleted:', cacheKey);
        }
    }

    async refreshKey<T>(namespaceId: string, key: string): Promise<T | null> {
        this.deleteMemoryKey(namespaceId, key);
        return this.getKey<T>(namespaceId, key);
    }

    getMemoryCacheStats(): { size: number; entries: [string, CacheEntry<any>][] } {
        return {
            size: this.memoryCache.size,
            entries: [...this.memoryCache.entries()]
        };
    }
}
