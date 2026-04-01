"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";
import type { GalleryImage } from "@/lib/actions/portfolio/portfolio.types";
import { internalFetch, internalJson } from "@/lib/api-client/internal-fetch";
import { getPresignedUploadUrl } from "@/lib/storage/r2";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GalleryUploadResult {
  uploadUrl: string;
  finalKey: string;
}

// ─── Actions ────────────────────────────────────────────────────────────────

/**
 * Lists all gallery images for a project from the backend DB.
 */
export async function listGalleryImagesAction(projectId: string) {
  return withActionResult<GalleryImage[]>(async () => {
    const { res, json } = await internalJson<GalleryImage[]>(
      `/api/v1/galleries/${encodeURIComponent(projectId)}`,
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`Failed to fetch galleries: ${text}`);
    }
    return json;
  });
}

/**
 * Generates a presigned upload URL for a new gallery image,
 * then registers it in the backend DB.
 */
export async function uploadGalleryImageAction(
  projectId: string,
  filename: string,
  contentType: string,
) {
  return withActionResult<GalleryUploadResult>(async () => {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uuid = crypto.randomUUID().split("-")[0];
    const finalKey = `projects/${projectId}/${uuid}-${cleanFilename}`;

    const uploadUrl = await getPresignedUploadUrl(finalKey, contentType);

    return { uploadUrl, finalKey };
  });
}

/**
 * Registers an uploaded image in the backend galleries table.
 */
export async function addGalleryImageAction(projectId: string, imageKey: string) {
  return withActionResult<GalleryImage>(async () => {
    const { res, json } = await internalJson<GalleryImage>(
      `/api/v1/galleries/${encodeURIComponent(projectId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_key: imageKey, order: 0 }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`Failed to add gallery image: ${text}`);
    }
    return json;
  });
}

/**
 * Deletes a gallery image from the backend DB.
 * (R2 cleanup can be handled separately or via a background job.)
 */
export async function deleteGalleryImageAction(projectId: string, galleryId: string) {
  return withActionResult<void>(async () => {
    const res = await internalFetch(
      `/api/v1/galleries/${encodeURIComponent(projectId)}/${encodeURIComponent(galleryId)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`Failed to delete gallery image: ${text}`);
    }
  });
}
