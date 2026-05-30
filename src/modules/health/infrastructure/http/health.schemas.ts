import { optionalDataSuccessResponseSchema } from "../../../../common/responses/http-response.schema.js";

export const healthRouteSchema = {
  tags: ["Health"],
  summary: "Health check",
  description: "Returns the service health status.",
  response: {
    200: optionalDataSuccessResponseSchema(),
  },
} as const;
