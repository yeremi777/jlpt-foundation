import { describe, expect, it } from "vitest";
import { parseKnownLevelReferences, parseLevelReferences, parseN3References } from "../scripts/lib/reference-parser.js";

describe("reference parser", () => {
  it("parses the current N3 reference files into stable top-level counts", async () => {
    const data = await parseN3References();

    expect(data.curriculum).toHaveLength(230);
    expect(data.kanji).toHaveLength(336);
    expect(data.quizPool).toHaveLength(1306);
  });

  it("groups curriculum entries by section", async () => {
    const data = await parseN3References();
    const counts = data.curriculum.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.section] = (acc[entry.section] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      grammar: 117,
      vocab: 52,
      kanji: 61,
    });
  });

  it("normalizes grammar metadata from the curriculum table", async () => {
    const data = await parseN3References();
    const entry = data.curriculum.find((item) => item.curriculumId === "g104");

    expect(entry).toMatchObject({
      id: "n3-grammar-g104",
      level: "n3",
      section: "grammar",
      source: "soumatome",
      week: 1,
      day: 2,
      title: "〜てしまう・〜ちゃう",
      reading: "te shimau / chau",
      meaning: {
        en: "Completion with regret or unintended result; ちゃう is casual",
        id: "Selesai dengan penyesalan atau tak disengaja; ちゃう bentuk kasual",
      },
      formula: "V(て)+しまう",
      difficulty: "medium",
      sourceTag: "B",
    });
  });

  it("normalizes empty kanji readings into empty arrays", async () => {
    const data = await parseN3References();
    const entry = data.kanji.find((item) => item.character === "駐");

    expect(entry).toMatchObject({
      id: "n3-kanji-u99d0",
      character: "駐",
      onyomi: ["チュウ"],
      kunyomi: [],
      examples: ["駐車", "駐車場"],
      week: 1,
      day: 1,
    });
  });

  it("builds dataset-backed quiz pool items without AI generation", async () => {
    const data = await parseN3References();
    const grammarQuizItem = data.quizPool.find((item) => item.id === "n3-grammar-g104-meaning");
    const kanjiQuizItem = data.quizPool.find((item) => item.id === "n3-kanji-u99d0-meaning");

    expect(grammarQuizItem).toMatchObject({
      generationMode: "dataset",
      section: "grammar",
      prompt: "〜てしまう・〜ちゃう",
      metadata: {
        quizType: "meaning",
        curriculumId: "g104",
      },
    });

    expect(kanjiQuizItem).toMatchObject({
      generationMode: "dataset",
      section: "kanji",
      prompt: "駐",
      answer: {
        en: "park vehicles, station troops",
        id: "parkir kendaraan, menempatkan pasukan",
      },
      metadata: {
        quizType: "meaning",
        week: 1,
        day: 1,
      },
    });
  });

  it("parses N4 reference files through the shared level parser", async () => {
    const data = await parseLevelReferences("n4");
    const counts = data.curriculum.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.section] = (acc[entry.section] ?? 0) + 1;
      return acc;
    }, {});

    expect(data.curriculum).toHaveLength(187);
    expect(counts).toEqual({
      grammar: 148,
      vocab: 18,
      kanji: 21,
    });
    expect(data.kanji).toHaveLength(198);
    expect(data.quizPool).toHaveLength(802);
  });

  it("parses N5 reference files through the shared level parser", async () => {
    const data = await parseLevelReferences("n5");
    const counts = data.curriculum.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.section] = (acc[entry.section] ?? 0) + 1;
      return acc;
    }, {});

    expect(data.curriculum).toHaveLength(105);
    expect(counts).toEqual({
      grammar: 91,
      vocab: 7,
      kanji: 7,
    });
    expect(data.kanji).toHaveLength(108);
    expect(data.quizPool).toHaveLength(514);
  });

  it("parses known N5, N4, and N3 references together", async () => {
    const data = await parseKnownLevelReferences(["n5", "n4", "n3"]);

    expect(data.curriculum).toHaveLength(522);
    expect(data.kanji).toHaveLength(642);
    expect(data.quizPool).toHaveLength(2622);
  });
});
