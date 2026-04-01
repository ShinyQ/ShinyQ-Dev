"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { getModel, listModels } from "./models.service";

export type { Model, ModelStatus } from "./models.types";

export async function listModelsResultAction() {
  return withActionResult(() => listModels());
}

export async function getModelResultAction(id: string) {
  return withActionResult(() => getModel(id));
}
