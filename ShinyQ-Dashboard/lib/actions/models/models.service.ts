import type { Model } from "./models.types";

/**
 * Models service — wire to your model registry or inference gateway.
 *
 * Currently returns mock data. Replace with real API calls
 * via internalJson() from @/lib/api-client.
 */

export async function listModels(): Promise<Model[]> {
  // TODO: replace with internalJson("/api/v1/models", ...)
  return [];
}

export async function getModel(_id: string): Promise<Model | null> {
  // TODO: replace with internalJson(`/api/v1/models/${id}`, ...)
  return null;
}
