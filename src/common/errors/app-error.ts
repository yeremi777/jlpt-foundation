export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super("BAD_REQUEST", message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super("NOT_FOUND", message, 404, details);
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string, details?: unknown) {
    super("NOT_IMPLEMENTED", message, 501, details);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string, details?: unknown) {
    super("GATEWAY_TIMEOUT", message, 504, details);
  }
}
