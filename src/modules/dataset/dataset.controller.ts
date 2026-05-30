import { FastifyReply, FastifyRequest } from "fastify";
import { ok } from "../../common/responses/http-response.js";
import {
  parseLevel,
  parseOptionalPositiveInteger,
  parseSection,
} from "./infrastructure/http/dataset-request.parser.js";
import { DatasetService } from "./dataset.service.js";

interface QueryParams {
  readonly level?: string;
  readonly week?: string;
  readonly day?: string;
  readonly section?: string;
}

interface IdParams {
  readonly id: string;
}

export class DatasetController {
  constructor(private readonly service: DatasetService) {}

  getLevels = async (_request: FastifyRequest, _reply: FastifyReply): Promise<unknown> => {
    return ok("Success", this.service.getLevels());
  };

  listKanji = async (request: FastifyRequest<{ Querystring: QueryParams }>): Promise<unknown> => {
    const level = parseLevel(request.query.level);
    const week = parseOptionalPositiveInteger(request.query.week, "week");
    const day = parseOptionalPositiveInteger(request.query.day, "day");
    const items = await this.service.listKanji({ level, week, day });

    return ok("Success", items);
  };

  getKanjiById = async (request: FastifyRequest<{ Params: IdParams }>): Promise<unknown> => {
    const item = await this.service.getKanjiById(request.params.id);

    return ok("Success", item);
  };

  listQuizPool = async (request: FastifyRequest<{ Querystring: QueryParams }>): Promise<unknown> => {
    const level = parseLevel(request.query.level);
    const section = parseSection(request.query.section);
    const items = await this.service.listQuizPool({ level, section });

    return ok("Success", items);
  };
}
