import { JlptLevel, LocalizedText, SourceRef } from "./reference-types.js";

export type RawItemType = "vocab" | "kanji" | "grammar";

export type RawItemStatus = "verified" | "unverified";

export type RawItemSource = "manual" | "ai-assisted" | "imported";

export interface RawBaseItem {
  readonly id: string;
  readonly level: JlptLevel;
  readonly type: RawItemType;
  readonly meaning: LocalizedText;
  readonly status: RawItemStatus;
  readonly source: RawItemSource;
  readonly tags: readonly string[];
  readonly isAiGenerated: boolean;
  readonly isVerified: boolean;
  readonly curriculumId?: string;
  readonly sourceRef?: SourceRef;
  readonly filePath: string;
  readonly body: string;
}

export interface RawVocabItem extends RawBaseItem {
  readonly type: "vocab";
  readonly writing: string;
  readonly reading: string;
  readonly romaji?: string;
}

export interface RawKanjiItem extends RawBaseItem {
  readonly type: "kanji";
  readonly character: string;
  readonly onyomi: readonly string[];
  readonly kunyomi: readonly string[];
}

export interface RawGrammarItem extends RawBaseItem {
  readonly type: "grammar";
  readonly pattern: string;
  readonly formula?: string;
  readonly explanation?: LocalizedText;
  readonly indonesianNotes: readonly string[];
}

export type RawLearningItem = RawVocabItem | RawKanjiItem | RawGrammarItem;

export interface RawParseResult {
  readonly items: readonly RawLearningItem[];
}
