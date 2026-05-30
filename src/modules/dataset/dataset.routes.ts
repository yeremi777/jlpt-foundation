import { FastifyInstance } from "fastify";
import { DatasetController } from "./dataset.controller.js";
import {
  generateQuizRouteSchema,
  getKanjiByIdRouteSchema,
  listKanjiRouteSchema,
  listLevelsRouteSchema,
  listQuizPoolRouteSchema,
} from "./infrastructure/http/dataset.schemas.js";

export function createDatasetRoutes(controller: DatasetController) {
  return async function datasetRoutes(app: FastifyInstance): Promise<void> {
    app.get("/levels", { schema: listLevelsRouteSchema }, controller.getLevels);
    app.get("/kanji", { schema: listKanjiRouteSchema }, controller.listKanji);
    app.get("/kanji/:id", { schema: getKanjiByIdRouteSchema }, controller.getKanjiById);
    app.get("/quizzes/pool", { schema: listQuizPoolRouteSchema }, controller.listQuizPool);
    app.post("/quizzes/generate", { schema: generateQuizRouteSchema }, controller.generateQuiz);
  };
}
