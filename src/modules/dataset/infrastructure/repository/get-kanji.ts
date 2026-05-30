import type {
  JlptLevel,
  KanjiItem,
} from "../../application/types/dataset.type.js";
import { readJson } from "./read-json.js";

export async function getKanji(
  level: JlptLevel,
  cache: Map<JlptLevel, readonly KanjiItem[]>,
): Promise<readonly KanjiItem[]> {
  const cached = cache.get(level);
  if (cached) {
    return cached;
  }

  const data = await readJson<readonly KanjiItem[]>(
    `data/normalized/${level}/kanji.json`,
  );
  cache.set(level, data);
  return data;
}
