export interface ApiSuccess<T> {
  readonly status: "success";
  readonly message: string;
  readonly data?: T;
  readonly paginate?: unknown;
}

export interface ApiClientError {
  readonly status: "failed";
  readonly message: string;
}

export interface ApiServerError {
  readonly status: "error";
  readonly error: unknown;
}

export function ok<T>(message: string, data?: T): ApiSuccess<T> {
  return { status: "success", message, ...(data && { data }) };
}

export function okPaginated<T>(
  message: string,
  data: readonly T[],
  paginate: unknown,
): ApiSuccess<readonly T[]> {
  return { status: "success", message, data, paginate };
}

export function clientError(message: string): ApiClientError {
  return { status: "failed", message };
}

export function serverError(
  error: unknown = "Internal server error",
): ApiServerError {
  return { status: "error", error };
}
