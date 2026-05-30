import { FastifyInstance } from "fastify";
import { HealthController } from "./health.controller.js";
import { healthRouteSchema } from "./infrastructure/http/health.schemas.js";

export function createHealthRoutes(controller: HealthController) {
  return async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/health", { schema: healthRouteSchema }, controller.getHealth);
  };
}
