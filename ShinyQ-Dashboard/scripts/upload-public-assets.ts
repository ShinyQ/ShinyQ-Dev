/**
 * One-off script: uploads ShinyQ portfolio static assets to Cloudflare R2.
 *
 * Migrates:
 *   ShinyQ/public/company/*.png  →  R2: company/<filename>
 *   ShinyQ/public/icons/*.webp   →  R2: icons/<filename>
 *
 * Usage (from ShinyQ-Dashboard root):
 *   bun scripts/upload-public-assets.ts
 *
 * Requires CLOUDFLARE_R2_* vars in .env.local.
 */

import { readFile, readdir } from "fs/promises";
import { join, extname, basename } from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ---------------------------------------------------------------------------
// Config — load from env (mirrors lib/config/env.ts but without server-only)
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

const accountId = requireEnv("CLOUDFLARE_R2_ACCOUNT_ID");
const accessKeyId = requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID");
const secretAccessKey = requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
const bucketName = requireEnv("CLOUDFLARE_R2_BUCKET_NAME");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: false,
});

// ---------------------------------------------------------------------------
// MIME helpers
// ---------------------------------------------------------------------------

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function mimeFor(filename: string): string {
  return MIME[extname(filename).toLowerCase()] ?? "application/octet-stream";
}

// ---------------------------------------------------------------------------
// Upload helpers
// ---------------------------------------------------------------------------

async function uploadFile(localPath: string, r2Key: string): Promise<void> {
  const body = await readFile(localPath);
  const contentType = mimeFor(localPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: body,
      ContentType: contentType,
    }),
  );

  console.log(`  ✓ ${r2Key}  (${(body.length / 1024).toFixed(1)} KB)`);
}

async function uploadDirectory(
  localDir: string,
  r2Prefix: string,
  extensions: string[],
): Promise<number> {
  let count = 0;
  const files = await readdir(localDir);

  for (const file of files) {
    if (!extensions.includes(extname(file).toLowerCase())) continue;
    const r2Key = `${r2Prefix}/${basename(file)}`;
    await uploadFile(join(localDir, file), r2Key);
    count++;
  }

  return count;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const PORTFOLIO_ROOT = join(import.meta.dir, "..", "..", "ShinyQ", "public");

async function main() {
  console.log(`Bucket: ${bucketName}`);
  console.log(`Portfolio public: ${PORTFOLIO_ROOT}\n`);

  console.log("→ Uploading company logos…");
  const logos = await uploadDirectory(
    join(PORTFOLIO_ROOT, "company"),
    "company",
    [".png", ".jpg", ".jpeg", ".webp"],
  );

  console.log(`\n→ Uploading tech stack icons…`);
  const icons = await uploadDirectory(
    join(PORTFOLIO_ROOT, "icons"),
    "icons",
    [".png", ".jpg", ".jpeg", ".webp", ".svg"],
  );

  console.log(`\nDone — ${logos} logos + ${icons} icons uploaded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
