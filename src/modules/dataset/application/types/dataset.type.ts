import type {
  JlptLevel,
  LearningSection,
  LocalizedText,
} from "../../../../common/types/learning.type.js";
export type { JlptLevel, LearningSection, LocalizedText };

export interface KanjiItem {
  readonly id: string;
  readonly level: JlptLevel;
  readonly type: "kanji";
  readonly character: string;
  readonly meaning: LocalizedText;
  readonly onyomi: readonly string[];
  readonly kunyomi: readonly string[];
  readonly examples: readonly string[];
  readonly source: string;
  readonly week: number;
  readonly day: number;
  readonly weekTitle: string;
  readonly dayTitle: string;
  readonly sequence: number;
  readonly sourceRef: Record<string, unknown>;
}

export interface QuizPoolItem {
  readonly id: string;
  readonly level: JlptLevel;
  readonly section: LearningSection;
  readonly sourceItemId: string;
  readonly generationMode: "dataset";
  readonly prompt: string;
  readonly answer: LocalizedText;
  readonly metadata: Record<string, unknown>;
}

export interface KanjiFilters {
  readonly level: JlptLevel;
  readonly week?: number;
  readonly day?: number;
}

export interface QuizPoolFilters {
  readonly level: JlptLevel;
  readonly section?: LearningSection;
}
