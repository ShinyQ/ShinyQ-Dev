import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";

/**
 * Represents a file in R2 storage.
 */
export interface R2File {
    key: string;
    size?: number;
    lastModified?: Date;
}

interface R2ClientConfig {
    region: string;
    endpoint: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    forcePathStyle: boolean;
}

const URL_CACHE = new Map<string, { url: string; expires: number }>();

/**
 * Singleton class for managing the R2 S3 client instance.
 */
class R2ClientManager {
    private static instance: R2ClientManager;
    private client: S3Client | null = null;
    private config: R2ClientConfig | null = null;

    private constructor() {
        this.initializeConfig();
    }

    /**
     * Returns the singleton instance of the R2ClientManager.
     * @returns The R2ClientManager instance
     */
    public static getInstance(): R2ClientManager {
        if (!R2ClientManager.instance) {
            R2ClientManager.instance = new R2ClientManager();
        }
        return R2ClientManager.instance;
    }

    /**
     * Initializes the R2 configuration based on the runtime environment.
     */
    private initializeConfig(): boolean {
        if (typeof window !== "undefined") {
            return false;
        }

        const { CLOUDFLARE } = config;

        if (!CLOUDFLARE.R2.ACCESS_KEY_ID || !CLOUDFLARE.R2.SECRET_ACCESS_KEY) {
            // Quietly fail if credentials are missing (expected during build)
            return false;
        }

        this.config = {
            region: "auto",
            endpoint: `https://${CLOUDFLARE.R2.ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: CLOUDFLARE.R2.ACCESS_KEY_ID,
                secretAccessKey: CLOUDFLARE.R2.SECRET_ACCESS_KEY,
            },
            forcePathStyle: false, // Must be false for R2 to work with custom domains or subdomains correctly
        };
        return true;
    }

    /**
     * Returns the S3 client instance. Initializes it if not already done.
     * @returns The initialized S3 client or null if setup failed
     */
    public getClient(): S3Client | null {
        if (!this.config) {
            // Attempt re-init or just fail gracefully
            if (!this.initializeConfig()) {
                return null;
            }
        }

        try {
            this.client ??= new S3Client(this.config!);
            return this.client;
        } catch (error) {
            console.error("Failed to initialize R2 client:", error);
            return null;
        }
    }

    /**
     * Executes an operation using the R2 S3 client.
     * @param operation - A callback receiving the client to perform an operation
     * @returns The result of the operation or null if it fails
     */
    public async withClient<T>(operation: (client: S3Client) => Promise<T>): Promise<T | null> {
        const client = this.getClient();
        if (!client) {
            // Silent return if client is not available
            return null;
        }

        try {
            return await Promise.race([
                operation(client),
                new Promise<null>((_, reject) =>
                    setTimeout(() => reject(new Error("Operation timeout")), config.R2.OPERATION_TIMEOUT)
                ),
            ]);
        } catch (error) {
            console.error("R2 operation failed:", error);
            return null;
        }
    }
}

/**
 * Retrieves a cached signed URL for the given key, if available and valid.
 * @param key - The file key
 * @returns The cached signed URL or null if not available
 */
function getCachedUrl(key: string): string | null {
    const cached = URL_CACHE.get(key);
    if (cached && Date.now() < cached.expires) {
        return cached.url;
    }
    URL_CACHE.delete(key);
    return null;
}

/**
 * Caches the signed URL for a given key with an adjusted expiry time.
 * @param key - The file key
 * @param url - The signed URL to cache
 */
function cacheUrl(key: string, url: string): void {
    URL_CACHE.set(key, {
        url,
        expires: Date.now() + (config.R2.SIGNED_URL_EXPIRY - 60) * 1000,
    });
}

/**
 * Clears the cache for a specific key or the entire cache if no key is provided.
 * @param key - The specific key to clear, or all if omitted
 */
function clearCache(key?: string): void {
    if (key) {
        URL_CACHE.delete(key);
    } else {
        URL_CACHE.clear();
    }
}

/**
 * Retrieves a signed URL for accessing a file in R2.
 * Falls back to a placeholder if signing fails and delete the cache.
 * @param key - The key of the file
 * @returns The signed URL or a placeholder path
 */
export async function getSignedFileUrl(key: string): Promise<string> {
    if (key.startsWith("http://") || key.startsWith("https://")) {
        return key;
    }

    if (key === "placeholder.svg") {
        return "/placeholder.svg";
    }

    try {
        const cachedUrl = getCachedUrl(key);
        if (cachedUrl) {
            return cachedUrl;
        }

        const r2Manager = R2ClientManager.getInstance();

        const signedUrl = await r2Manager.withClient(async (client) => {
            const command = new GetObjectCommand({
                Bucket: config.CLOUDFLARE.R2.BUCKET_NAME,
                Key: key,
            });

            return getSignedUrl(client, command, {
                expiresIn: config.R2.SIGNED_URL_EXPIRY,
                signableHeaders: new Set(["host"]),
            });
        });

        if (signedUrl) {
            cacheUrl(key, signedUrl);
            return signedUrl;
        }

        clearCache(key);
        return "/placeholder.svg";
    } catch (error) {
        console.error("Error getting signed URL:", error);
        clearCache(key);
        return "/placeholder.svg";
    }
}

/**
 * Lists files in a directory within the R2 bucket.
 * @param prefix - The prefix path representing the directory
 * @returns An array of R2File entries
 */
export async function listDirectoryFiles(prefix: string): Promise<R2File[]> {
    const r2Manager = R2ClientManager.getInstance();

    const files = await r2Manager.withClient(async (client) => {
        const command = new ListObjectsV2Command({
            Bucket: config.CLOUDFLARE.R2.BUCKET_NAME,
            Prefix: prefix,
        });

        const response = await client.send(command);
        return response.Contents ?? [];
    });

    if (!files) {
        return [];
    }

    return files
        .filter(file => file.Key && file.Key !== prefix)
        .map(file => ({
            key: file.Key!,
            size: file.Size,
            lastModified: file.LastModified,
        }));
}