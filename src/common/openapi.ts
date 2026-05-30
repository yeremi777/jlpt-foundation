import type { SwaggerOptions } from "@fastify/swagger";

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "JLPT Foundation API",
      description: "API foundation for JLPT N5, N4, and N3 learning content.",
      version: "0.1.0",
    },
    servers: [
      {
        url: "/",
        description: "Current API server",
      },
    ],
    tags: [
      { name: "Health", description: "Service health checks." },
      { name: "Dataset", description: "Read-only JLPT dataset endpoints." },
      { name: "Quiz", description: "Dataset-backed quiz pool endpoints." },
    ],
    components: {
      parameters: {
        ItemID: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      },
      responses: {
        BadRequestResponse: {
          description: "Invalid request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["failed"] },
                  message: { type: "string" },
                },
                required: ["status", "message"],
              },
            },
          },
        },
        NotFoundResponse: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["failed"] },
                  message: { type: "string" },
                },
                required: ["status", "message"],
              },
            },
          },
        },
        InternalServerErrorResponse: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["error"] },
                  error: { type: "string", example: "Internal server error" },
                },
                required: ["status", "error"],
              },
            },
          },
        },
      },
    },
  },
};
