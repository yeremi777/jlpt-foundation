import { BadRequestError } from "../../../../common/errors/app-error.js";
import { JLPT_LEVELS } from "../../application/dataset.constant.js";
import type {
  JlptLevel,
  LearningSection,
} from "../../application/types/dataset.type.js";

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
  if (typeof value !== "string" || !/^\d+$/u.test(value)) {
    throw new BadRequestError(`Invalid ${field}. Expected a positive integer.`);
  }
  const parsed = Number(value);
  if (parsed <= 0) {
    throw new BadRequestError(`Invalid ${field}. Expected a positive integer.`);
  }
  return parsed;
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
