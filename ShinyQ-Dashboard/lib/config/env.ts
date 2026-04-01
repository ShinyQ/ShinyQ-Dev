import "server-only";

const isDev = process.env.NODE_ENV !== "production";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Set it in .env.local (dev) or your deployment config (production).`,
    );
  }
  return value;
}

function getInternalApiUrl(): string {
  if (isDev) {
    return (
      process.env.INTERNAL_API_URL ??
      process.env.BACKEND_API_URL ??
      "http://127.0.0.1:8000"
    );
  }
  // In production, require an explicit value — silent localhost fallback is a footgun.
  return requireEnv("INTERNAL_API_URL");
}

/**
 * Validated environment config — evaluated once on module load.
 * In production, missing required vars will throw at startup rather than
 * silently falling back to localhost.
 */
export const env = {
  INTERNAL_API_URL: getInternalApiUrl().replace(/\/+$/, ""),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isDev,
  R2: {
    accountId: requireEnv("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    bucketName: requireEnv("CLOUDFLARE_R2_BUCKET_NAME"),
  },
} as const;
