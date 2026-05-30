import type {
  JlptLevel,
  QuizPoolItem,
} from "../../application/types/dataset.type.js";
import { readJson } from "../../../../common/utils/read-json.js";

export async function getQuizPool(
  level: JlptLevel,
  cache: Map<JlptLevel, readonly QuizPoolItem[]>,
): Promise<readonly QuizPoolItem[]> {
  const cached = cache.get(level);
  if (cached) {
    return cached;
  }

  const data = await readJson<readonly QuizPoolItem[]>(
    `data/normalized/${level}/quiz-pool.json`,
  );
  cache.set(level, data);
  return data;
}
