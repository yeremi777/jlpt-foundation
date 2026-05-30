import type { DatasetRepository } from "../../application/ports/dataset-repository.port.js";
import type {
  JlptLevel,
  KanjiItem,
  QuizPoolItem,
} from "../../application/types/dataset.type.js";
import { getKanji } from "./get-kanji.js";
import { getKanjiById } from "./get-kanji-by-id.js";
import { getLevels } from "./get-levels.js";
import { getQuizPool } from "./get-quiz-pool.js";

const kanjiCache = new Map<JlptLevel, readonly KanjiItem[]>();
const quizPoolCache = new Map<JlptLevel, readonly QuizPoolItem[]>();

export default {
  getLevels() {
    return getLevels();
  },

  getKanji(level) {
    return getKanji(level, kanjiCache);
  },

  getKanjiById(id) {
    return getKanjiById(id, kanjiCache);
  },

  getQuizPool(level) {
    return getQuizPool(level, quizPoolCache);
  },
} satisfies DatasetRepository;
