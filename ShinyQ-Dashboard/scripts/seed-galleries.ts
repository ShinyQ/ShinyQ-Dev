/**
 * Seed script: migrate existing R2 gallery images into the project_galleries table.
 *
 * Usage: bun scripts/seed-galleries.ts
 *
 * For each known slug → R2 prefix mapping, this script:
 *  1. Fetches the project UUID from the API by slug.
 *  2. Lists all image objects under the R2 prefix.
 *  3. POSTs each image key to GET /api/v1/galleries/{project_id}.
 */

import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

// ─── Config ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8002";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

// ─── Slug → R2 prefix mapping ────────────────────────────────────────────────
// Maps the project slug in the DB to the R2 directory that holds its gallery.

const GALLERY_MAP: Record<string, string> = {
  "shinqy-portfolio":                "projects/shinyqweb",
  "shumishop":                       "projects/shumi",
  "shumi-dashboard":                 "projects/shumidashboard",
  "shumi-business-case":             "projects/shumibusinesscase",
  "eha":                             "projects/eha",
  "helby":                           "projects/helby",
  "sentiboard":                      "projects/sentiboard",
  "stock-portfolio-optimizer":       "projects/stockoptimization",
  "unjani-alumni":                   "projects/unjani_alumni",
  "unjani-counseling":               "projects/unjani_counseling",
  "absa-ewallet-insonesia":          "projects/absa_digital_wallet",
  "crypto-portfolio-tracker":        "projects/crypto-tracker",
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp"]);

function isImage(key: string) {
  const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchProjectBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
  const res = await fetch(`${API_BASE}/api/v1/projects/`);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
  const projects: Array<{ id: string; slug: string }> = await res.json();
  return projects.find((p) => p.slug === slug) ?? null;
}

async function listR2Images(prefix: string): Promise<string[]> {
  const normalised = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const cmd = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: normalised });
  const resp = await r2.send(cmd);
  return (resp.Contents ?? [])
    .map((o) => o.Key!)
    .filter((k) => k && k !== normalised && isImage(k));
}

async function addGalleryImage(projectId: string, imageKey: string, order: number) {
  const res = await fetch(`${API_BASE}/api/v1/galleries/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_key: imageKey, order }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /galleries failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function clearGallery(projectId: string) {
  const res = await fetch(`${API_BASE}/api/v1/galleries/${projectId}`);
  if (!res.ok) return;
  const existing: Array<{ id: string }> = await res.json();
  for (const row of existing) {
    await fetch(`${API_BASE}/api/v1/galleries/${projectId}/${row.id}`, { method: "DELETE" });
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱  Gallery seed — API: ${API_BASE}\n`);

  for (const [slug, prefix] of Object.entries(GALLERY_MAP)) {
    console.log(`── ${slug}  (R2: ${prefix})`);

    // 1. Find project
    const project = await fetchProjectBySlug(slug);
    if (!project) {
      console.log(`   ⚠️  Project with slug "${slug}" not found in DB — skipping`);
      continue;
    }
    console.log(`   id: ${project.id}`);

    // 2. List R2 images
    const keys = await listR2Images(prefix);
    if (keys.length === 0) {
      console.log(`   ⚠️  No images found at R2 prefix "${prefix}" — skipping`);
      continue;
    }
    console.log(`   Found ${keys.length} image(s) in R2`);

    // 3. Clear existing gallery rows (idempotent re-run)
    await clearGallery(project.id);

    // 4. Insert each key
    for (let i = 0; i < keys.length; i++) {
      await addGalleryImage(project.id, keys[i]!, i);
      console.log(`   [${i + 1}/${keys.length}] ${keys[i]}`);
    }

    console.log(`   ✅ Done\n`);
  }

  console.log("🎉  Gallery seed complete!\n");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
