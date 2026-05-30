import { ParsedReferenceData } from "./reference-parser.js";

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function validateReferenceData(data: ParsedReferenceData): ValidationResult {
  const errors: string[] = [];

  validateNonEmpty("curriculum", data.curriculum.length, errors);
  validateNonEmpty("kanji", data.kanji.length, errors);
  validateNonEmpty("quizPool", data.quizPool.length, errors);

  const curriculumIds = new Set<string>();
  for (const entry of data.curriculum) {
    if (curriculumIds.has(entry.id)) {
      errors.push(`Duplicate curriculum id: ${entry.id}`);
    }
    curriculumIds.add(entry.id);

    if (!entry.title) {
      errors.push(`Missing curriculum title: ${entry.id}`);
    }

    if (!entry.meaning.en || !entry.meaning.id) {
      errors.push(`Missing curriculum bilingual meaning: ${entry.id}`);
    }

    if (entry.section === "grammar" && !entry.formula) {
      errors.push(`Missing grammar formula: ${entry.id}`);
    }
  }

  const kanjiIds = new Set<string>();
  const kanjiChars = new Set<string>();
  for (const entry of data.kanji) {
    if (kanjiIds.has(entry.id)) {
      errors.push(`Duplicate kanji id: ${entry.id}`);
    }
    kanjiIds.add(entry.id);

    const characterKey = `${entry.level}:${entry.character}`;
    if (kanjiChars.has(characterKey)) {
      errors.push(`Duplicate kanji character in ${entry.level}: ${entry.character}`);
    }
    kanjiChars.add(characterKey);

    if (!entry.character) {
      errors.push(`Missing kanji character: ${entry.id}`);
    }

    if (!entry.meaning.en || !entry.meaning.id) {
      errors.push(`Missing kanji bilingual meaning: ${entry.id}`);
    }

    if (entry.onyomi.length === 0 && entry.kunyomi.length === 0) {
      errors.push(`Missing kanji reading: ${entry.id}`);
    }

    if (entry.examples.length === 0) {
      errors.push(`Missing kanji examples: ${entry.id}`);
    }
  }

  const quizIds = new Set<string>();
  for (const item of data.quizPool) {
    if (quizIds.has(item.id)) {
      errors.push(`Duplicate quiz pool id: ${item.id}`);
    }
    quizIds.add(item.id);

    if (!item.prompt || !item.answer.en || !item.answer.id) {
      errors.push(`Incomplete quiz pool item: ${item.id}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function validateNonEmpty(name: string, count: number, errors: string[]): void {
  if (count <= 0) {
    errors.push(`${name} parsed no records`);
  }
}
