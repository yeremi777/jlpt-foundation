export const successResponseSchema = (dataSchema: object) =>
  ({
    description: "Successful response",
    type: "object",
    properties: {
      status: { type: "string", enum: ["success"] },
      message: { type: "string" },
      data: dataSchema,
    },
    required: ["status", "message", "data"],
  }) as const;

export const optionalDataSuccessResponseSchema = () =>
  ({
    description: "Successful response",
    type: "object",
    properties: {
      status: { type: "string", enum: ["success"] },
      message: { type: "string" },
    },
    required: ["status", "message"],
  }) as const;

export const successArrayResponseSchema = (itemSchema: object) =>
  successResponseSchema({
    type: "array",
    items: itemSchema,
  });

const paginationSchema = {
  type: "object",
  properties: {
    currentPage: { type: "integer" },
    lastPage: { type: "integer" },
    size: { type: "integer" },
    from: { type: ["integer", "null"] },
    to: { type: ["integer", "null"] },
    total: { type: "integer" },
  },
  required: ["currentPage", "lastPage", "size", "from", "to", "total"],
} as const;

export const paginatedArrayResponseSchema = (itemSchema: object) =>
  ({
    description: "Successful paginated response",
    type: "object",
    properties: {
      status: { type: "string", enum: ["success"] },
      message: { type: "string" },
      data: {
        type: "array",
        items: itemSchema,
      },
      paginate: paginationSchema,
    },
    required: ["status", "message", "data", "paginate"],
  }) as const;

export const clientErrorResponseSchema = (description: string) =>
  ({
    description,
    type: "object",
    properties: {
      status: { type: "string", enum: ["failed"] },
      message: { type: "string" },
    },
    required: ["status", "message"],
  }) as const;

export const serverErrorResponseSchema = (
  description = "Internal server error",
) =>
  ({
    description,
    type: "object",
    properties: {
      status: { type: "string", enum: ["error"] },
      error: { type: "string" },
    },
    required: ["status", "error"],
  }) as const;
