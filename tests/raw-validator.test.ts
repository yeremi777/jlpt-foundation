import { describe, expect, it } from "vitest";
import { parseRawDataset } from "../scripts/lib/raw-parser.js";
import { RawLearningItem } from "../scripts/lib/raw-types.js";
import { validateRawItems } from "../scripts/lib/raw-validator.js";

describe("raw markdown validator", () => {
  it("accepts the current generated raw kanji dataset", async () => {
    const { items } = await parseRawDataset();
    const result = validateRawItems(items);

    expect(result).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("rejects duplicate raw item IDs", async () => {
    const { items } = await parseRawDataset();
    const duplicate = items[0]!;
    const result = validateRawItems([duplicate, duplicate, ...items.slice(1)]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Duplicate raw item id: ${duplicate.id}`);
  });

  it("rejects missing bilingual meanings", async () => {
    const { items } = await parseRawDataset();
    const brokenItem: RawLearningItem = {
      ...items[0]!,
      meaning: {
        en: "",
        id: items[0]!.meaning.id,
      },
    };
    const result = validateRawItems([brokenItem, ...items.slice(1)]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`Missing bilingual meaning: ${brokenItem.id}`);
  });

  it("rejects verified AI-generated items", async () => {
    const { items } = await parseRawDataset();
    const brokenItem: RawLearningItem = {
      ...items[0]!,
      source: "ai-assisted",
      status: "verified",
      isAiGenerated: true,
      isVerified: true,
    };
    const result = validateRawItems([brokenItem, ...items.slice(1)]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`AI-generated item cannot be verified: ${brokenItem.id}`);
    expect(result.errors).toContain(`AI-assisted item must stay unverified until reviewed: ${brokenItem.id}`);
  });
});
