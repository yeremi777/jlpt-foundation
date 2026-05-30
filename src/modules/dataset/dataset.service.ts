import { NotFoundError } from "../../common/errors/app-error.js";
import type { DatasetRepository } from "./application/ports/dataset-repository.port.js";
import type {
  JlptLevel,
  KanjiFilters,
  KanjiItem,
  QuizPoolFilters,
  QuizPoolItem,
} from "./application/types/dataset.type.js";

export class DatasetService {
  constructor(private readonly repository: DatasetRepository) {}

  getLevels(): readonly JlptLevel[] {
    return this.repository.getLevels();
  }

  async listKanji(filters: KanjiFilters): Promise<readonly KanjiItem[]> {
    const items = await this.repository.getKanji(filters.level);

    return items.filter((item) => {
      if (filters.week !== undefined && item.week !== filters.week) {
        return false;
      }
      if (filters.day !== undefined && item.day !== filters.day) {
        return false;
      }
      return true;
    });
  }

  async getKanjiById(id: string): Promise<KanjiItem> {
    const item = await this.repository.getKanjiById(id);

    if (!item) {
      throw new NotFoundError(`Kanji item not found: ${id}`);
    }

    return item;
  }

  async listQuizPool(
    filters: QuizPoolFilters,
  ): Promise<readonly QuizPoolItem[]> {
    const items = await this.repository.getQuizPool(filters.level);

    return items.filter((item) => {
      if (filters.section !== undefined && item.section !== filters.section) {
        return false;
      }
      return true;
    });
  }
}
