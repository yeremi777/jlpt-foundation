import { BadRequestError } from "../../../../common/errors/app-error.js";
import { JLPT_LEVELS } from "../../application/dataset.constant.js";
import type {
  GenerateQuizInput,
  JlptLevel,
  LearningSection,
  QuizGenerationMode,
  QuizType,
} from "../../application/types/dataset.type.js";

interface GenerateQuizBody {
  readonly level?: unknown;
  readonly section?: unknown;
  readonly count?: unknown;
  readonly generationMode?: unknown;
  readonly quizType?: unknown;
}

export function parseLevel(value: unknown): JlptLevel {
  if (JLPT_LEVELS.includes(value as JlptLevel)) {
    return value as JlptLevel;
  }
  throw new BadRequestError(
    "Invalid or missing level. Expected n5, n4, or n3.",
  );
}

export function parseOptionalPositiveInteger(
  value: unknown,
  field: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value !== "string" || !/^\d+$/u.test(value)) {
    throw new BadRequestError(`Invalid ${field}. Expected a positive integer.`);
  }
  const parsed = Number(value);
  if (parsed <= 0) {
    throw new BadRequestError(`Invalid ${field}. Expected a positive integer.`);
  }
  return parsed;
}

export function parsePositiveInteger(
  value: unknown,
  field: string,
): number {
  const parsed = parseOptionalPositiveInteger(value, field);
  if (parsed === undefined) {
    throw new BadRequestError(`Invalid or missing ${field}. Expected a positive integer.`);
  }
  return parsed;
}

export function parsePagination(query: {
  readonly page?: unknown;
  readonly size?: unknown;
}): { readonly page: number; readonly size: number } {
  const page = parseOptionalPositiveInteger(query.page, "page") ?? 1;
  const size = parseOptionalPositiveInteger(query.size, "size") ?? 10;

  if (size > 100) {
    throw new BadRequestError("Invalid size. Maximum size is 100.");
  }

  return { page, size };
}

export function parseSection(value: unknown): LearningSection | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === "kanji" || value === "grammar" || value === "vocab") {
    return value;
  }
  throw new BadRequestError(
    "Invalid section. Expected kanji, grammar, or vocab.",
  );
}

export function parseRequiredSection(value: unknown): LearningSection {
  const section = parseSection(value);
  if (!section) {
    throw new BadRequestError("Invalid or missing section. Expected kanji, grammar, or vocab.");
  }
  return section;
}

export function parseGenerateQuizBody(body: unknown): GenerateQuizInput {
  if (!isGenerateQuizBody(body)) {
    throw new BadRequestError("Invalid request body.");
  }

  const generationMode = body.generationMode ?? "dataset";

  if (generationMode !== "dataset" && generationMode !== "ai_generated") {
    throw new BadRequestError(
      "Invalid generationMode. Expected dataset or ai_generated.",
    );
  }
  const requestedQuizTypes = parseQuizTypes(body.quizType);
  const quizTypes =
    generationMode === "dataset" ? (["meaning"] as const) : requestedQuizTypes;

  const count = parsePositiveInteger(body.count, "count");
  if (count > 50) {
    throw new BadRequestError("Invalid count. Maximum count is 50.");
  }

  return {
    level: parseLevel(body.level),
    section: parseRequiredSection(body.section),
    count,
    generationMode: generationMode as QuizGenerationMode,
    quizTypes,
  };
}

function isGenerateQuizBody(value: unknown): value is GenerateQuizBody {
  return typeof value === "object" && value !== null;
}

function parseQuizTypes(value: unknown): readonly QuizType[] {
  if (value === undefined) {
    return ["meaning"];
  }

  const requestedValues = Array.isArray(value) ? value : [value];

  if (requestedValues.length === 0 || requestedValues.some((item) => !isQuizType(item))) {
    throw new BadRequestError(
      "Invalid quizType. Expected an array containing meaning, reading, or compound.",
    );
  }

  return Array.from(new Set(requestedValues));
}

function isQuizType(value: unknown): value is QuizType {
  return value === "meaning" || value === "reading" || value === "compound";
}
