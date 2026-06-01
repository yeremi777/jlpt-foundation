import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseSimpleYaml, YamlObject, YamlValue } from "./simple-yaml.js";
import {
  RawGrammarItem,
  RawItemSource,
  RawItemStatus,
  RawItemType,
  RawKanjiItem,
  RawLearningItem,
  RawParseResult,
  RawVocabItem,
} from "./raw-types.js";
import { CurriculumSection, JlptLevel, LocalizedText, SourceRef } from "./reference-types.js";

const ROOT_DIR = path.resolve(new URL("../..", import.meta.url).pathname);

export async function parseRawDataset(): Promise<RawParseResult> {
  const rawDir = path.join(ROOT_DIR, "public/data/raw");
  const files = await findMarkdownFiles(rawDir);
  const items = await Promise.all(files.map((filePath) => parseRawItemFile(filePath)));

  return {
    items: items.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export async function parseRawItemFile(filePath: string): Promise<RawLearningItem> {
  const markdown = await readFile(filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(markdown, filePath);
  const data = parseSimpleYaml(frontmatter);
  const relativePath = path.relative(ROOT_DIR, filePath);

  return rawItemFromFrontmatter(data, body.trim(), relativePath);
}

export function rawItemFromFrontmatter(
  data: YamlObject,
  body: string,
  filePath: string,
): RawLearningItem {
  const type = asType(requiredString(data.type, "type"));
  const base = {
    id: requiredString(data.id, "id"),
    level: asLevel(requiredString(data.level, "level")),
    type,
    meaning: requiredLocalizedText(data.meaning, "meaning"),
    status: asStatus(requiredString(data.status, "status")),
    source: asSource(requiredString(data.source, "source")),
    tags: asStringArray(data.tags),
    isAiGenerated: optionalBoolean(data.is_ai_generated) ?? data.source === "ai-assisted",
    isVerified: optionalBoolean(data.is_verified) ?? data.status === "verified",
    curriculumId: optionalString(data.curriculum_id),
    sourceRef: optionalSourceRef(data.source_ref),
    filePath,
    body,
  };

  if (type === "vocab") {
    const item: RawVocabItem = {
      ...base,
      type,
      writing: requiredString(data.writing, "writing"),
      reading: requiredString(data.reading, "reading"),
      romaji: optionalString(data.romaji),
    };
    return item;
  }

  if (type === "kanji") {
    const item: RawKanjiItem = {
      ...base,
      type,
      character: requiredString(data.character, "character"),
      onyomi: asStringArray(data.onyomi),
      kunyomi: asStringArray(data.kunyomi),
    };
    return item;
  }

  const item: RawGrammarItem = {
    ...base,
    type,
    pattern: requiredString(data.pattern, "pattern"),
    formula: optionalString(data.formula),
    explanation: optionalLocalizedText(data.explanation),
    indonesianNotes: asStringArray(data.indonesian_notes),
  };
  return item;
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findMarkdownFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  }));

  return files.flat().sort();
}

function splitFrontmatter(markdown: string, filePath: string): { frontmatter: string; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u);
  if (!match) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }

  return {
    frontmatter: match[1] ?? "",
    body: match[2] ?? "",
  };
}

function requiredString(value: YamlValue | undefined, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required string field: ${field}`);
  }
  return value.trim();
}

function optionalString(value: YamlValue | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalBoolean(value: YamlValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asStringArray(value: YamlValue | undefined): string[] {
  if (!value) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error("Expected list field");
  }
  return value.map((item) => {
    if (typeof item !== "string") {
      throw new Error("Expected string list item");
    }
    return item;
  });
}

function requiredLocalizedText(value: YamlValue | undefined, field: string): LocalizedText {
  const localized = optionalLocalizedText(value);
  if (!localized || !localized.en || !localized.id) {
    throw new Error(`Missing bilingual field: ${field}`);
  }
  return localized;
}

function optionalLocalizedText(value: YamlValue | undefined): LocalizedText | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }
  const en = value.en;
  const id = value.id;
  if (typeof en !== "string" || typeof id !== "string") {
    return undefined;
  }
  return {
    en: en.trim(),
    id: id.trim(),
  };
}

function optionalSourceRef(value: YamlValue | undefined): SourceRef | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }
  return buildSourceRef(value);
}

function buildSourceRef(value: Record<string, YamlValue>): SourceRef | undefined {
  const primaryTextbook = value.primary_textbook === "soumatome" ? "soumatome" : undefined;
  const depthReference = parseDepthReference(value.depth_reference);
  const bookLevel = typeof value.book_level === "string" ? asLevel(value.book_level) : undefined;
  const section = typeof value.section === "string" ? asCurriculumSection(value.section) : undefined;
  const sequence = typeof value.sequence === "number" ? value.sequence : undefined;

  if (!primaryTextbook || !bookLevel || !section || !sequence) {
    return undefined;
  }

  return {
    primaryTextbook,
    depthReference,
    bookLevel,
    section,
    week: typeof value.week === "number" ? value.week : undefined,
    day: typeof value.day === "number" ? value.day : undefined,
    sequence,
  };
}

function asCurriculumSection(value: string): CurriculumSection | undefined {
  if (value === "vocab" || value === "kanji" || value === "grammar") {
    return value;
  }
  return undefined;
}

function parseDepthReference(value: YamlValue | undefined): "shinkanzen" | "minna-no-nihongo" | undefined {
  if (value === "shinkanzen" || value === "minna-no-nihongo") {
    return value;
  }
  return undefined;
}

function asLevel(value: string): JlptLevel {
  if (value === "n5" || value === "n4" || value === "n3" || value === "n2" || value === "n1") {
    return value;
  }
  throw new Error(`Unsupported level: ${value}`);
}

function asType(value: string): RawItemType {
  if (value === "vocab" || value === "kanji" || value === "grammar") {
    return value;
  }
  throw new Error(`Unsupported raw item type: ${value}`);
}

function asStatus(value: string): RawItemStatus {
  if (value === "verified" || value === "unverified") {
    return value;
  }
  throw new Error(`Unsupported raw item status: ${value}`);
}

function asSource(value: string): RawItemSource {
  if (value === "manual" || value === "ai-assisted" || value === "imported") {
    return value;
  }
  throw new Error(`Unsupported raw item source: ${value}`);
}
