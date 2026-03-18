import { cache } from "@/lib/cache";
import { config } from "@/config";

async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function trackUniqueVisitor(ip: string, userAgent: string): Promise<boolean> {
    try {
        const visitorId = await hashString(`${ip}-${userAgent}`);
        const uniqueKey = `${config.VISITOR.UNIQUE_KEY}:${visitorId}`;

        // Check if already tracked
        const exists = await cache.exists(uniqueKey);
        if (exists) return false;

        // Mark visitor and increment count atomically
        await Promise.all([
            cache.set(uniqueKey, "1", config.VISITOR.EXPIRY),
            cache.incr(config.VISITOR.UNIQUE_KEY),
        ]);

        return true;
    } catch (error) {
        console.error("[Visitor Tracking] Error:", error);
        return false;
    }
}

export async function getUniqueVisitorCount(): Promise<number> {
    try {
        const count = await cache.get<number | string>(config.VISITOR.UNIQUE_KEY);
        if (!count) return 0;

        const parsed = typeof count === 'number' ? count : parseInt(count, 10);
        return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
        console.error("[Visitor Count] Error:", error);
        return 0;
    }
}
