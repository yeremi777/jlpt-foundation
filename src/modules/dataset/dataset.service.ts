import { NotFoundError } from "../../common/errors/app-error.js";
import {
  paginateItems,
  type PaginatedResult,
} from "../../common/pagination.js";
import { generateDatasetQuiz } from "./infrastructure/repository/generate-dataset-quiz.js";
import type { AiQuizGenerator } from "./application/ports/ai-quiz-generator.port.js";
import type { DatasetRepository } from "./application/ports/dataset-repository.port.js";
import type {
  GeneratedQuiz,
  GenerateQuizInput,
  JlptLevel,
  KanjiFilters,
  KanjiItem,
  QuizPoolFilters,
  QuizPoolItem,
} from "./application/types/dataset.type.js";

export class DatasetService {
  constructor(
    private readonly repository: DatasetRepository,
    private readonly aiQuizGenerator: AiQuizGenerator,
  ) {}

  getLevels(): readonly JlptLevel[] {
    return this.repository.getLevels();
  }

  async listKanji(filters: KanjiFilters): Promise<PaginatedResult<KanjiItem>> {
    const items = await this.repository.getKanji(filters.level);

    const filteredItems = items.filter((item) => {
      if (filters.week !== undefined && item.week !== filters.week) {
        return false;
      }
      if (filters.day !== undefined && item.day !== filters.day) {
        return false;
      }
      return true;
    });

    return paginateItems(filteredItems, filters);
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
  ): Promise<PaginatedResult<QuizPoolItem>> {
    const items = await this.repository.getQuizPool(filters.level);

    const filteredItems = items.filter((item) => {
      if (filters.section !== undefined && item.section !== filters.section) {
        return false;
      }
      return true;
    });

    return paginateItems(filteredItems, filters);
  }

  async generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuiz> {
    const items = await this.repository.getQuizPool(input.level);
    const candidates = items.filter((item) => item.section === input.section);

    if (input.generationMode === "ai_generated") {
      return this.aiQuizGenerator.generateQuiz(input, candidates);
    }

    return generateDatasetQuiz(input, candidates);
  }
}
