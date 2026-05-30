import type {
  JlptLevel,
  KanjiItem,
  QuizPoolItem,
} from "../types/dataset.type.js";

export interface DatasetRepository {
  getLevels(): readonly JlptLevel[];
  getKanji(level: JlptLevel): Promise<readonly KanjiItem[]>;
  getKanjiById(id: string): Promise<KanjiItem | undefined>;
  getQuizPool(level: JlptLevel): Promise<readonly QuizPoolItem[]>;
}
