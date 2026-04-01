import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/config/env";

const SIGNED_URL_EXPIRY = 3600; // 1 hour

class R2ClientManager {
  private static instance: R2ClientManager;
  private client: S3Client;

  private constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2.accessKeyId,
        secretAccessKey: env.R2.secretAccessKey,
      },
      forcePathStyle: false,
    });
  }

  public static getInstance(): R2ClientManager {
    if (!R2ClientManager.instance) {
      R2ClientManager.instance = new R2ClientManager();
    }
    return R2ClientManager.instance;
  }

  public getClient(): S3Client {
    return this.client;
  }
}

/**
 * Generates a presigned URL that allows a client to DOWNLOAD a private file.
 * The generated URL is inherently temporary.
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const s3 = R2ClientManager.getInstance().getClient();
  const command = new GetObjectCommand({
    Bucket: env.R2.bucketName,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: SIGNED_URL_EXPIRY,
    signableHeaders: new Set(["host"]),
  });
}

/**
 * Generates a presigned URL that allows a client to DIRECTLY UPLOAD a file
 * from their browser into this exact path in R2.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const s3 = R2ClientManager.getInstance().getClient();
  const command = new PutObjectCommand({
    Bucket: env.R2.bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes to upload
  });
}

