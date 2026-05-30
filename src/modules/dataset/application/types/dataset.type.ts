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
  readonly page: number;
  readonly size: number;
}

export interface QuizPoolFilters {
  readonly level: JlptLevel;
  readonly section?: LearningSection;
  readonly page: number;
  readonly size: number;
}

export type QuizGenerationMode = "dataset" | "ai_generated";

export type QuizType = "meaning" | "reading" | "compound";

export type QuizChoiceKey = "A" | "B" | "C" | "D";

export interface GenerateQuizInput {
  readonly level: JlptLevel;
  readonly section: LearningSection;
  readonly count: number;
  readonly generationMode: QuizGenerationMode;
  readonly quizTypes: readonly QuizType[];
}

export interface LocalizedQuizChoice {
  readonly key: QuizChoiceKey;
  readonly answer: LocalizedText;
}

export interface ReadingQuizChoice {
  readonly key: QuizChoiceKey;
  readonly answer: string;
}

interface GeneratedQuizQuestionBase {
  readonly id: string;
  readonly sourceItemId: string;
  readonly section: LearningSection;
  readonly prompt: string;
  readonly answerKey: QuizChoiceKey;
  readonly generationMode: QuizGenerationMode;
  readonly isAiGenerated: boolean;
  readonly isVerified: boolean;
}

export interface MeaningQuizQuestion extends GeneratedQuizQuestionBase {
  readonly quizType: "meaning";
  readonly choices: readonly LocalizedQuizChoice[];
  readonly answer: LocalizedText;
}

export interface CompoundQuizQuestion extends GeneratedQuizQuestionBase {
  readonly quizType: "compound";
  readonly choices: readonly LocalizedQuizChoice[];
  readonly answer: LocalizedText;
}

export interface ReadingQuizQuestion extends GeneratedQuizQuestionBase {
  readonly quizType: "reading";
  readonly choices: readonly ReadingQuizChoice[];
  readonly answer: string;
}

export type GeneratedQuizQuestion =
  | MeaningQuizQuestion
  | ReadingQuizQuestion
  | CompoundQuizQuestion;

export interface GeneratedQuiz {
  readonly id: string;
  readonly level: JlptLevel;
  readonly section: LearningSection;
  readonly generationMode: QuizGenerationMode;
  readonly quizTypes: readonly QuizType[];
  readonly questions: readonly GeneratedQuizQuestion[];
}
