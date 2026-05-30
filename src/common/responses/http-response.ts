export interface ApiSuccess<T> {
  readonly status: "success";
  readonly message: string;
  readonly data?: T;
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

export function clientError(message: string): ApiClientError {
  return { status: "failed", message };
}

export function serverError(
  error: unknown = "Internal server error",
): ApiServerError {
  return { status: "error", error };
}
