import { z } from 'zod';

// Time constants (in seconds)
const FIVE_MINUTES = 5 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60;

const getEnvVar = (key: string): string | undefined => {
    return process.env[key];
};

const configSchema = z.object({
    GITHUB: z.object({
        API_TOKEN: z.string().optional(),
        CACHE: z.object({
            KEY_TOP_REPO: z.string(),
            TOP_REPO_TTL: z.number().default(ONE_WEEK),
        }),
    }),
    CACHE: z.object({
        DEFAULT_TTL: z.number().default(FIVE_MINUTES * 1000), // in milliseconds
    }),
    VISITOR: z.object({
        UNIQUE_KEY: z.string(),
        EXPIRY: z.number().default(FIVE_MINUTES), // in seconds
    }),
    R2: z.object({
        SIGNED_URL_EXPIRY: z.number().default(ONE_WEEK), // in seconds
        OPERATION_TIMEOUT: z.number().default(3000), // in milliseconds
    }),
    CLOUDFLARE: z.object({
        KV: z.object({
            ACCOUNT_ID: z.string().optional(),
            API_TOKEN: z.string().optional(),
            KV_NAMESPACE_ID: z.string().optional(),
        }),
        R2: z.object({
            ACCOUNT_ID: z.string().optional(),
            ACCESS_KEY_ID: z.string().optional(),
            SECRET_ACCESS_KEY: z.string().optional(),
            BUCKET_NAME: z.string().optional(),
        }),
    }),
});

// Parse and validate configuration
const config = configSchema.parse({
    GITHUB: {
        API_TOKEN: getEnvVar('GITHUB_API_TOKEN'),
        CACHE: {
            KEY_TOP_REPO: 'github:top_repos',
            TOP_REPO_TTL: ONE_WEEK,
        }
    },
    CACHE: {
        DEFAULT_TTL: FIVE_MINUTES * 1000,
    },
    VISITOR: {
        UNIQUE_KEY: "site:unique_visitors",
        EXPIRY: FIVE_MINUTES,
    },
    R2: {
        SIGNED_URL_EXPIRY: ONE_WEEK,
        OPERATION_TIMEOUT: 3000,
    },
    CLOUDFLARE: {
        KV: {
            ACCOUNT_ID: getEnvVar('CLOUDFLARE_ACCOUNT_ID'),
            API_TOKEN: getEnvVar('CLOUDFLARE_KV_API_TOKEN'),
            KV_NAMESPACE_ID: getEnvVar('CLOUDFLARE_KV_NAMESPACE_ID'),
        },
        R2: {
            ACCOUNT_ID: getEnvVar('CLOUDFLARE_R2_ACCOUNT_ID'),
            ACCESS_KEY_ID: getEnvVar('CLOUDFLARE_R2_ACCESS_KEY_ID'),
            SECRET_ACCESS_KEY: getEnvVar('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
            BUCKET_NAME: getEnvVar('CLOUDFLARE_R2_BUCKET_NAME'),
        }
    }
});

// Validate required environment variables at runtime (server-side only)
// Commented out to allow app to run without all env vars
/*
if (typeof window === 'undefined') {
    const requiredEnvVars = [
        'GITHUB_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'CLOUDFLARE_KV_API_TOKEN',
        'CLOUDFLARE_KV_NAMESPACE_ID',
        'CLOUDFLARE_R2_ACCOUNT_ID',
        'CLOUDFLARE_R2_ACCESS_KEY_ID',
        'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
        'CLOUDFLARE_R2_BUCKET_NAME'
    ];

    const missingVars = requiredEnvVars.filter(varName => !getEnvVar(varName));
    if (missingVars.length > 0) {
        console.warn('Missing required environment variables:', missingVars);
    }
}
*/

export { config };
