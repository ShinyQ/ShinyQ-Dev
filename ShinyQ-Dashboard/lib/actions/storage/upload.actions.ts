"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";
import { getPresignedUploadUrl } from "@/lib/storage/r2";

export interface UploadUrlResult {
  uploadUrl: string;
  finalKey: string;
}

export async function generateUploadUrlAction(
  filename: string,
  contentType: string,
  prefix: string = "blog",
) {
  return withActionResult<UploadUrlResult>(async () => {
    // Generate a secure unique key like `blog/1a2b3c-filename.png`
    const uuid = crypto.randomUUID().split("-")[0];
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const finalKey = `${prefix}/${uuid}-${cleanFilename}`;

    const uploadUrl = await getPresignedUploadUrl(finalKey, contentType);

    return {
      uploadUrl,
      finalKey,
    };
  });
}
