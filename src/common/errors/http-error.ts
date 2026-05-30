export function hasClientStatusCode(
  error: unknown,
): error is { readonly statusCode: number; readonly message: string } {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { readonly statusCode?: unknown };

  return (
    typeof candidate.statusCode === "number" &&
    candidate.statusCode >= 400 &&
    candidate.statusCode < 500
  );
}
