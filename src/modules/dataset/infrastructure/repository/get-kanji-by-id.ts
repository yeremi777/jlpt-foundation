import type { JlptLevel, KanjiItem } from "../../application/types/dataset.type.js";
import { getKanji } from "./get-kanji.js";

export async function getKanjiById(
  id: string,
  cache: Map<JlptLevel, readonly KanjiItem[]>,
): Promise<KanjiItem | undefined> {
  const level = parseLevelFromKanjiId(id);
  const items = await getKanji(level, cache);

  return items.find((candidate) => candidate.id === id);
}

function parseLevelFromKanjiId(id: string): JlptLevel {
  const [level] = id.split("-");
  if (level === "n5" || level === "n4" || level === "n3") {
    return level;
  }
  return "n5";
}
