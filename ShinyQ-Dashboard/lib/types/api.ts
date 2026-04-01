/** Mirror baseline §8.1–8.2 for BFF and FastAPI alignment. */

export type ApiMeta = {
  requestId: string;
};

export type ApiPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ApiDataEnvelope<T> = {
  data: T;
  meta?: ApiMeta;
  pagination?: ApiPagination;
};

export type ApiErrorCodes =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "INTERNAL";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};

export type ApiErrorEnvelope = {
  error: ApiErrorBody;
};
