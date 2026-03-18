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
    VISITOR: z.object({
        UNIQUE_KEY: z.string(),
        EXPIRY: z.number().default(FIVE_MINUTES), // in seconds
    }),
    R2: z.object({
        SIGNED_URL_EXPIRY: z.number().default(ONE_WEEK), // in seconds
        OPERATION_TIMEOUT: z.number().default(3000), // in milliseconds
    }),
    CLOUDFLARE: z.object({
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
    VISITOR: {
        UNIQUE_KEY: "site:unique_visitors",
        EXPIRY: FIVE_MINUTES,
    },
    R2: {
        SIGNED_URL_EXPIRY: ONE_WEEK,
        OPERATION_TIMEOUT: 3000,
    },
    CLOUDFLARE: {
        R2: {
            ACCOUNT_ID: getEnvVar('CLOUDFLARE_R2_ACCOUNT_ID'),
            ACCESS_KEY_ID: getEnvVar('CLOUDFLARE_R2_ACCESS_KEY_ID'),
            SECRET_ACCESS_KEY: getEnvVar('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
            BUCKET_NAME: getEnvVar('CLOUDFLARE_R2_BUCKET_NAME'),
        }
    }
});

export { config };
