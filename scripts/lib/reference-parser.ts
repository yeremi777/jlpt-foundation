import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  CurriculumEntry,
  CurriculumSection,
  Difficulty,
  JlptLevel,
  KanjiReferenceEntry,
  QuizPoolItem,
  SourceTag,
} from "./reference-types.js";
import {
  buildRow,
  cleanMarkdownInline,
  isTableRow,
  isTableSeparator,
  parseTableRow,
} from "./markdown-table.js";

const ROOT_DIR = path.resolve(new URL("../..", import.meta.url).pathname);

export interface ParsedReferenceData {
  readonly curriculum: readonly CurriculumEntry[];
  readonly kanji: readonly KanjiReferenceEntry[];
  readonly quizPool: readonly QuizPoolItem[];
}

interface CurriculumContext {
  section?: CurriculumSection;
  source?: "soumatome" | "shinkanzen" | "minna-no-nihongo";
  category?: string;
  week?: number;
  day?: number;
  weekTitle?: string;
  sequence: number;
}

interface KanjiContext {
  week?: number;
  day?: number;
  weekTitle?: string;
  dayTitle?: string;
  sequence: number;
}

export async function parseN3References(): Promise<ParsedReferenceData> {
  return parseLevelReferences("n3");
}

export async function parseLevelReferences(level: JlptLevel): Promise<ParsedReferenceData> {
  const referenceDir = path.join(ROOT_DIR, `public/data/reference/${level}`);
  const curriculumPath = path.join(referenceDir, `${level}_curriculum_toc.md`);
  const kanjiPath = path.join(referenceDir, `${level}_kanji_list.md`);

  const curriculumText = await readOptionalText(curriculumPath);
  const kanjiText = await readOptionalText(kanjiPath);

  const curriculum = curriculumText ? parseCurriculumToc(curriculumText, level) : [];
  const kanji = kanjiText ? parseKanjiList(kanjiText, level) : [];
  const quizPool = buildQuizPool(curriculum, kanji);

  return { curriculum, kanji, quizPool };
}

export async function parseKnownLevelReferences(levels: readonly JlptLevel[]): Promise<ParsedReferenceData> {
  const parsed = await Promise.all(levels.map((level) => parseLevelReferences(level)));

  return {
    curriculum: parsed.flatMap((data) => data.curriculum),
    kanji: parsed.flatMap((data) => data.kanji),
    quizPool: parsed.flatMap((data) => data.quizPool),
  };
}

export function parseCurriculumToc(markdown: string, level: JlptLevel): CurriculumEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: CurriculumEntry[] = [];
  const context: CurriculumContext = { sequence: 0 };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";

    updateCurriculumContext(line, context);

    if (!isTableRow(line)) {
      continue;
    }

    const headers = parseTableRow(line);
    const separator = lines[index + 1]?.trim() ?? "";
    if (!isTableSeparator(separator)) {
      continue;
    }

    index += 2;
    for (; index < lines.length && isTableRow(lines[index] ?? ""); index += 1) {
      const cells = parseTableRow(lines[index] ?? "");
      const row = buildRow(headers, cells);
      const maybeCategory = cleanMarkdownInline(row.ID ?? "");

      if (maybeCategory && cells.slice(1).every((cell) => cell.trim() === "") && maybeCategory !== "ID") {
        context.category = maybeCategory;
        continue;
      }

      const entry = curriculumEntryFromRow(row, context, level);
      if (entry) {
        entries.push(entry);
      }
    }
    index -= 1;
  }

  return entries;
}

export function parseKanjiList(markdown: string, level: JlptLevel): KanjiReferenceEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: KanjiReferenceEntry[] = [];
  const context: KanjiContext = { sequence: 0 };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";
    updateKanjiContext(line, context);

    if (!isTableRow(line)) {
      continue;
    }

    const headers = parseTableRow(line);
    if (headers.join("|") !== "Kanji|On|Kun|English|Indonesian|Examples") {
      continue;
    }

    const separator = lines[index + 1]?.trim() ?? "";
    if (!isTableSeparator(separator)) {
      continue;
    }

    index += 2;
    for (; index < lines.length && isTableRow(lines[index] ?? ""); index += 1) {
      const cells = parseTableRow(lines[index] ?? "");
      const row = buildRow(headers, cells);
      const entry = kanjiEntryFromRow(row, context, level);
      entries.push(entry);
    }
    index -= 1;
  }

  return entries;
}

function updateCurriculumContext(line: string, context: CurriculumContext): void {
  if (line.startsWith("## 文法")) {
    context.section = "grammar";
    context.source = "soumatome";
    context.category = undefined;
    return;
  }

  if (line.startsWith("## 語彙")) {
    context.section = "vocab";
    context.source = line.includes("Soumatome") ? "soumatome" : undefined;
    context.category = undefined;
    return;
  }

  if (line.startsWith("## 漢字")) {
    context.section = "kanji";
    context.source = line.includes("Soumatome") ? "soumatome" : undefined;
    context.category = undefined;
    return;
  }

  if (/Soumatome\s+N[1-5]/u.test(line)) {
    context.source = "soumatome";
  }

  if (/Shinkanzen Master\s+N[1-5]/u.test(line)) {
    context.source = "shinkanzen";
    context.week = undefined;
    context.day = undefined;
  }

  if (line.includes("Minna no Nihongo")) {
    context.source = "minna-no-nihongo";
    context.week = undefined;
    context.day = undefined;
  }

  const weekMatch = line.match(/^#{3,4}\s+Week\s+(\d+)\s+—\s+(.+)$/);
  if (weekMatch) {
    context.week = Number(weekMatch[1]);
    context.weekTitle = cleanHeadingTitle(weekMatch[2] ?? "");
    context.day = undefined;
  }
}

function updateKanjiContext(line: string, context: KanjiContext): void {
  const weekMatch = line.match(/^##\s+Week\s+(\d+)\s+—\s+(.+)$/);
  if (weekMatch) {
    context.week = Number(weekMatch[1]);
    context.weekTitle = cleanHeadingTitle(weekMatch[2] ?? "");
    context.day = undefined;
    context.dayTitle = undefined;
    return;
  }

  const dayMatch = line.match(/^###\s+Day\s+(\d+)\s+—\s+(.+)$/);
  if (dayMatch) {
    context.day = Number(dayMatch[1]);
    context.dayTitle = cleanHeadingTitle(dayMatch[2] ?? "");
  }
}

function curriculumEntryFromRow(
  row: Record<string, string>,
  context: CurriculumContext,
  level: JlptLevel,
): CurriculumEntry | undefined {
  if (!context.section || !context.source) {
    return undefined;
  }

  const curriculumId = cleanMarkdownInline(row.ID ?? "");
  if (!curriculumId || curriculumId === "ID" || !/^(g|v|k|sk_[vk]|n[1-5]_(g|v|k|gm))\d+/u.test(curriculumId)) {
    return undefined;
  }

  const sequence = nextSequence(context);
  const day = parseOptionalNumber(row.Day);
  const lesson = parseOptionalNumber(row.Lesson);
  const round = parseOptionalNumber(row.Round);
  const sourceTag = parseSourceTag(row.Src);
  const difficulty = parseDifficulty(row.Diff);
  const title = cleanMarkdownInline(row.Pattern || row.Topic || "");
  const section = context.section;

  return {
    id: `${level}-${section}-${curriculumId}`,
    curriculumId,
    level,
    section,
    source: context.source,
    category: context.category,
    week: context.week,
    day,
    lesson,
    round,
    sequence,
    title,
    reading: cleanOptional(row.Reading),
    meaning: {
      en: cleanMarkdownInline(row.English ?? ""),
      id: cleanMarkdownInline(row.Indonesian ?? ""),
    },
    formula: cleanOptional(row.Formula),
    difficulty,
    sourceTag,
    sourceRef: {
      primaryTextbook: "soumatome",
      depthReference: level === "n4" ? "minna-no-nihongo" : "shinkanzen",
      bookLevel: level,
      section,
      week: context.week,
      day,
      lesson,
      round,
      sequence,
      sourceTag,
      difficulty,
    },
  };
}

function kanjiEntryFromRow(
  row: Record<string, string>,
  context: KanjiContext,
  level: JlptLevel,
): KanjiReferenceEntry {
  if (!context.week || !context.day || !context.weekTitle || !context.dayTitle) {
    throw new Error(`Kanji row appeared before week/day context: ${JSON.stringify(row)}`);
  }

  const character = cleanMarkdownInline(row.Kanji ?? "");
  const sequence = nextSequence(context);

  return {
    id: `${level}-kanji-${codepointSlug(character)}`,
    level,
    type: "kanji",
    character,
    meaning: {
      en: cleanMarkdownInline(row.English ?? ""),
      id: cleanMarkdownInline(row.Indonesian ?? ""),
    },
    onyomi: splitJapaneseList(row.On),
    kunyomi: splitJapaneseList(row.Kun),
    examples: splitJapaneseList(row.Examples),
    source: "soumatome",
    week: context.week,
    day: context.day,
    weekTitle: context.weekTitle,
    dayTitle: context.dayTitle,
    sequence,
    sourceRef: {
      primaryTextbook: "soumatome",
      depthReference: level === "n4" ? "minna-no-nihongo" : "shinkanzen",
      bookLevel: level,
      section: "kanji",
      week: context.week,
      day: context.day,
      sequence,
    },
  };
}

function buildQuizPool(
  curriculum: readonly CurriculumEntry[],
  kanji: readonly KanjiReferenceEntry[],
): QuizPoolItem[] {
  const grammarItems = curriculum
    .filter((entry) => entry.section === "grammar")
    .map<QuizPoolItem>((entry) => ({
      id: `${entry.id}-meaning`,
      level: entry.level,
      section: "grammar",
      sourceItemId: entry.id,
      generationMode: "dataset",
      prompt: entry.title,
      answer: entry.meaning,
      metadata: {
        quizType: "meaning",
        curriculumId: entry.curriculumId,
        formula: entry.formula,
        week: entry.week,
        day: entry.day,
        difficulty: entry.difficulty,
      },
    }));

  const kanjiMeaningItems = kanji.map<QuizPoolItem>((entry) => ({
    id: `${entry.id}-meaning`,
    level: entry.level,
    section: "kanji",
    sourceItemId: entry.id,
    generationMode: "dataset",
    prompt: entry.character,
    answer: entry.meaning,
    metadata: {
      quizType: "meaning",
      onyomi: entry.onyomi,
      kunyomi: entry.kunyomi,
      week: entry.week,
      day: entry.day,
    },
  }));

  return [...grammarItems, ...kanjiMeaningItems];
}

function nextSequence(context: { sequence: number }): number {
  context.sequence += 1;
  return context.sequence;
}

function cleanHeadingTitle(value: string): string {
  return cleanMarkdownInline(value).replace(/\s*\*\(.+\)\*$/, "").trim();
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = value.match(/\d+/u);
  return match ? Number(match[0]) : undefined;
}

function parseDifficulty(value: string | undefined): Difficulty | undefined {
  const cleaned = cleanMarkdownInline(value ?? "");
  return cleaned === "easy" || cleaned === "medium" || cleaned === "hard" ? cleaned : undefined;
}

function parseSourceTag(value: string | undefined): SourceTag | undefined {
  const cleaned = cleanMarkdownInline(value ?? "");
  return cleaned === "S" || cleaned === "K" || cleaned === "M" || cleaned === "B" ? cleaned : undefined;
}

function cleanOptional(value: string | undefined): string | undefined {
  const cleaned = cleanMarkdownInline(value ?? "");
  return cleaned.length > 0 ? cleaned : undefined;
}

function splitJapaneseList(value: string | undefined): string[] {
  const cleaned = cleanMarkdownInline(value ?? "");
  if (!cleaned || cleaned === "—" || cleaned === "-") {
    return [];
  }
  return cleaned
    .split(/[、,]/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function codepointSlug(value: string): string {
  return Array.from(value)
    .map((char) => `u${char.codePointAt(0)?.toString(16) ?? "unknown"}`)
    .join("-");
}

async function readOptionalText(filePath: string): Promise<string | undefined> {
  try {
    await access(filePath);
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}
