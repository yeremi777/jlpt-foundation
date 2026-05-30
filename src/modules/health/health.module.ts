import { FastifyInstance } from "fastify";
import { HealthController } from "./health.controller.js";
import { createHealthRoutes } from "./health.routes.js";

export async function healthModule(app: FastifyInstance): Promise<void> {
  const controller = new HealthController();

  await app.register(createHealthRoutes(controller));
}
