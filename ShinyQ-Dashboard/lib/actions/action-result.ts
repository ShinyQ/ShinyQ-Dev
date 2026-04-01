export type ActionErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "INTERNAL";

export interface ActionErrorPayload {
  message: string;
  code: ActionErrorCode;
  referenceId?: string;
  fieldErrors?: Record<string, string[]>;
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorPayload };

export class ActionError extends Error {
  code: Exclude<ActionErrorCode, "INTERNAL">;

  constructor(
    message: string,
    code: Exclude<ActionErrorCode, "INTERNAL"> = "VALIDATION",
  ) {
    super(message);
    this.name = "ActionError";
    this.code = code;
  }
}

export const INTERNAL_ACTION_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessageCandidate(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const messages = value
      .map((entry) => extractMessageCandidate(entry))
      .filter((entry): entry is string => Boolean(entry));
    return messages.length > 0 ? messages.join("\n") : null;
  }
  if (isRecord(value)) {
    if ("detail" in value) return extractMessageCandidate(value.detail);
    if ("message" in value) return extractMessageCandidate(value.message);
    if ("error" in value) return extractMessageCandidate(value.error);
  }
  return null;
}

function getHttpStatus(error: unknown): number | null {
  if (isRecord(error) && typeof error.status === "number") {
    return error.status;
  }
  return null;
}

function mapHttpStatusToActionErrorCode(status: number): ActionErrorCode {
  if (status === 403 || status === 401) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 400 && status < 500) return "VALIDATION";
  return "INTERNAL";
}

export function getUserFacingErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const extracted = extractMessageCandidate(error);
    if (extracted) return extracted;
    const m = error.message?.trim();
    if (m) return m;
  }
  return extractMessageCandidate(error) ?? INTERNAL_ACTION_ERROR_MESSAGE;
}

export function createSuccessResult<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function createErrorResult<T = never>(
  error: ActionErrorPayload,
): ActionResult<T> {
  return { ok: false, error };
}

export function isActionError(error: unknown): error is ActionError {
  return error instanceof ActionError;
}

export function toActionErrorPayload(error: unknown): ActionErrorPayload {
  if (isActionError(error)) {
    return { message: error.message, code: error.code };
  }
  const status = getHttpStatus(error);
  if (status !== null && status >= 400 && status < 500) {
    return {
      message: getUserFacingErrorMessage(error),
      code: mapHttpStatusToActionErrorCode(status),
    };
  }
  const referenceId = crypto.randomUUID();
  console.error(`[Server Action Error][${referenceId}]`, error);
  return {
    message: INTERNAL_ACTION_ERROR_MESSAGE,
    code: "INTERNAL",
    referenceId,
  };
}

export function unwrapActionResult<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data;
  const error = new Error(result.error.message);
  error.name = result.error.code;
  if (result.error.referenceId) {
    Object.assign(error, { referenceId: result.error.referenceId });
  }
  throw error;
}
