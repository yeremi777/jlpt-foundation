import { FastifyInstance } from "fastify";
import { datasetModule } from "./modules/dataset/dataset.module.js";
import { healthModule } from "./modules/health/health.module.js";

export async function apiRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthModule);
  await app.register(datasetModule);
}
