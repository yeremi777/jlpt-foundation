import { describe, expect, it } from "vitest";
import { parseN3References, ParsedReferenceData } from "../scripts/lib/reference-parser.js";
import { validateReferenceData } from "../scripts/lib/reference-validator.js";

describe("reference validator", () => {
  it("accepts the current parsed N3 references", async () => {
    const data = await parseN3References();
    const result = validateReferenceData(data);

    expect(result).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("rejects duplicate curriculum IDs", async () => {
    const data = await parseN3References();
    const duplicate = {
      ...data.curriculum[0],
    };
    const invalidData: ParsedReferenceData = {
      ...data,
      curriculum: [duplicate, duplicate, ...data.curriculum.slice(1)],
    };

    const result = validateReferenceData(invalidData);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Duplicate curriculum id: ${duplicate.id}`);
  });

  it("rejects duplicate kanji characters", async () => {
    const data = await parseN3References();
    const duplicate = {
      ...data.kanji[0],
      id: "n3-kanji-test-duplicate",
    };
    const invalidData: ParsedReferenceData = {
      ...data,
      kanji: [duplicate, ...data.kanji],
    };

    const result = validateReferenceData(invalidData);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Duplicate kanji character in ${duplicate.level}: ${duplicate.character}`);
  });

  it("rejects missing bilingual curriculum meanings", async () => {
    const data = await parseN3References();
    const brokenEntry = {
      ...data.curriculum[0],
      meaning: {
        en: "",
        id: data.curriculum[0]?.meaning.id ?? "",
      },
    };
    const invalidData: ParsedReferenceData = {
      ...data,
      curriculum: [brokenEntry, ...data.curriculum.slice(1)],
    };

    const result = validateReferenceData(invalidData);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Missing curriculum bilingual meaning: ${brokenEntry.id}`);
  });

  it("rejects incomplete quiz pool items", async () => {
    const data = await parseN3References();
    const brokenQuizItem = {
      ...data.quizPool[0],
      prompt: "",
    };
    const invalidData: ParsedReferenceData = {
      ...data,
      quizPool: [brokenQuizItem, ...data.quizPool.slice(1)],
    };

    const result = validateReferenceData(invalidData);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Incomplete quiz pool item: ${brokenQuizItem.id}`);
  });
});
