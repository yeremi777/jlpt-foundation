import { JLPT_LEVELS } from "../../application/dataset.constant.js";
import type { JlptLevel } from "../../application/types/dataset.type.js";

export function getLevels(): readonly JlptLevel[] {
  return JLPT_LEVELS;
}
