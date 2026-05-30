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

export const serverErrorResponseSchema = () =>
  ({
    description: "Internal server error",
    type: "object",
    properties: {
      status: { type: "string", enum: ["error"] },
      error: { type: "string" },
    },
    required: ["status", "error"],
  }) as const;
