import { FastifyInstance } from "fastify";
import { datasetModule } from "./modules/dataset/dataset.module.js";

export async function apiRoutes(app: FastifyInstance): Promise<void> {
  await app.register(datasetModule);
}
