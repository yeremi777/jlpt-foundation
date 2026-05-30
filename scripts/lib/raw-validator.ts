import { RawLearningItem } from "./raw-types.js";

export interface RawValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function validateRawItems(items: readonly RawLearningItem[]): RawValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      errors.push(`Duplicate raw item id: ${item.id}`);
    }
    ids.add(item.id);

    const expectedIdPrefix = `${item.level}-${item.type}-`;
    if (!item.id.startsWith(expectedIdPrefix)) {
      errors.push(`Raw item id must start with ${expectedIdPrefix}: ${item.id}`);
    }

    if (!item.meaning.en || !item.meaning.id) {
      errors.push(`Missing bilingual meaning: ${item.id}`);
    }

    if (item.isAiGenerated && item.isVerified) {
      errors.push(`AI-generated item cannot be verified: ${item.id}`);
    }

    if (item.source === "ai-assisted" && item.status === "verified") {
      errors.push(`AI-assisted item must stay unverified until reviewed: ${item.id}`);
    }

    validateTypeSpecificFields(item, errors);
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function validateTypeSpecificFields(item: RawLearningItem, errors: string[]): void {
  if (item.type === "vocab") {
    if (!item.writing || !item.reading) {
      errors.push(`Missing vocab writing or reading: ${item.id}`);
    }
    return;
  }

  if (item.type === "kanji") {
    if (!item.character) {
      errors.push(`Missing kanji character: ${item.id}`);
    }
    if (item.onyomi.length === 0 && item.kunyomi.length === 0) {
      errors.push(`Missing kanji reading: ${item.id}`);
    }
    return;
  }

  if (!item.pattern) {
    errors.push(`Missing grammar pattern: ${item.id}`);
  }
}
