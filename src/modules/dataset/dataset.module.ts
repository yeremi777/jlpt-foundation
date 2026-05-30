import { FastifyInstance } from "fastify";
import { DatasetController } from "./dataset.controller.js";
import { createDatasetRoutes } from "./dataset.routes.js";
import { DatasetService } from "./dataset.service.js";
import createAiQuizGenerator from "./infrastructure/ai/index.js";
import jsonDatasetRepository from "./infrastructure/repository/index.js";

export async function datasetModule(app: FastifyInstance): Promise<void> {
  const service = new DatasetService(
    jsonDatasetRepository,
    createAiQuizGenerator(),
  );
  const controller = new DatasetController(service);

  await app.register(createDatasetRoutes(controller));
}
