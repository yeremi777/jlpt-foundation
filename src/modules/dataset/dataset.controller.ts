import { FastifyReply, FastifyRequest } from "fastify";
import { ok, okPaginated } from "../../common/responses/http-response.js";
import {
  parseGenerateQuizBody,
  parseLevel,
  parseOptionalPositiveInteger,
  parsePagination,
  parseSection,
} from "./infrastructure/http/dataset-request.parser.js";
import { DatasetService } from "./dataset.service.js";

interface QueryParams {
  readonly level?: string;
  readonly week?: string;
  readonly day?: string;
  readonly section?: string;
  readonly page?: string;
  readonly size?: string;
}

interface IdParams {
  readonly id: string;
}

interface GenerateQuizBody {
  readonly level?: unknown;
  readonly section?: unknown;
  readonly count?: unknown;
  readonly generationMode?: unknown;
  readonly quizType?: unknown;
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
    const pagination = parsePagination(request.query);
    const result = await this.service.listKanji({ level, week, day, ...pagination });

    return okPaginated("Success", result.items, result.paginate);
  };

  getKanjiById = async (request: FastifyRequest<{ Params: IdParams }>): Promise<unknown> => {
    const item = await this.service.getKanjiById(request.params.id);

    return ok("Success", item);
  };

  listQuizPool = async (request: FastifyRequest<{ Querystring: QueryParams }>): Promise<unknown> => {
    const level = parseLevel(request.query.level);
    const section = parseSection(request.query.section);
    const pagination = parsePagination(request.query);
    const result = await this.service.listQuizPool({ level, section, ...pagination });

    return okPaginated("Success", result.items, result.paginate);
  };

  generateQuiz = async (request: FastifyRequest<{ Body: GenerateQuizBody }>): Promise<unknown> => {
    const input = parseGenerateQuizBody(request.body);
    const quiz = await this.service.generateQuiz(input);

    return ok("Success", quiz);
  };
}
