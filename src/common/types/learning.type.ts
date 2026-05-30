export type JlptLevel = "n5" | "n4" | "n3";

export type LearningSection = "kanji" | "grammar" | "vocab";

export interface LocalizedText {
  readonly en: string;
  readonly id: string;
}
