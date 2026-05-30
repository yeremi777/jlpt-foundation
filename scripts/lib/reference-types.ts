export type JlptLevel = "n5" | "n4" | "n3" | "n2" | "n1";

export type CurriculumSection = "grammar" | "vocab" | "kanji";

export type SourceTag = "S" | "K" | "M" | "B";

export type Difficulty = "easy" | "medium" | "hard";

export interface LocalizedText {
  readonly en: string;
  readonly id: string;
}

export interface SourceRef {
  readonly primaryTextbook: "soumatome";
  readonly depthReference?: "shinkanzen" | "minna-no-nihongo";
  readonly bookLevel: JlptLevel;
  readonly section: CurriculumSection;
  readonly week?: number;
  readonly day?: number;
  readonly lesson?: number;
  readonly round?: number;
  readonly sequence: number;
  readonly sourceTag?: SourceTag;
  readonly difficulty?: Difficulty;
}

export interface CurriculumEntry {
  readonly id: string;
  readonly curriculumId: string;
  readonly level: JlptLevel;
  readonly section: CurriculumSection;
  readonly source: "soumatome" | "shinkanzen" | "minna-no-nihongo";
  readonly category?: string;
  readonly week?: number;
  readonly day?: number;
  readonly lesson?: number;
  readonly round?: number;
  readonly sequence: number;
  readonly title: string;
  readonly reading?: string;
  readonly meaning: LocalizedText;
  readonly formula?: string;
  readonly difficulty?: Difficulty;
  readonly sourceTag?: SourceTag;
  readonly sourceRef: SourceRef;
}

export interface KanjiReferenceEntry {
  readonly id: string;
  readonly level: JlptLevel;
  readonly type: "kanji";
  readonly character: string;
  readonly meaning: LocalizedText;
  readonly onyomi: readonly string[];
  readonly kunyomi: readonly string[];
  readonly examples: readonly string[];
  readonly source: "soumatome";
  readonly week: number;
  readonly day: number;
  readonly weekTitle: string;
  readonly dayTitle: string;
  readonly sequence: number;
  readonly sourceRef: SourceRef;
}

export interface QuizPoolItem {
  readonly id: string;
  readonly level: JlptLevel;
  readonly section: CurriculumSection;
  readonly sourceItemId: string;
  readonly generationMode: "dataset";
  readonly prompt: string;
  readonly answer: LocalizedText;
  readonly metadata: Record<string, unknown>;
}

export interface ParseSummary {
  readonly curriculumEntries: number;
  readonly kanjiEntries: number;
  readonly quizPoolItems: number;
  readonly curriculumBySection: Record<CurriculumSection, number>;
}
