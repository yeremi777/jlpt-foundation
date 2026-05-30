import { describe, expect, it } from "vitest";
import { parseRawDataset } from "../scripts/lib/raw-parser.js";

describe("raw markdown parser", () => {
  it("parses generated N5, N4, and N3 kanji raw markdown files", async () => {
    const { items } = await parseRawDataset();

    expect(items).toHaveLength(642);
  });

  it("parses generated items by level and type", async () => {
    const { items } = await parseRawDataset();
    const counts = items.reduce<Record<string, number>>((acc, item) => {
      const key = `${item.level}/${item.type}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      "n3/kanji": 336,
      "n4/kanji": 198,
      "n5/kanji": 108,
    });
  });

  it("parses generated kanji metadata with source references", async () => {
    const { items } = await parseRawDataset();
    const item = items.find((entry) => entry.id === "n3-kanji-u99d0");

    expect(item).toMatchObject({
      id: "n3-kanji-u99d0",
      curriculumId: "k101",
      level: "n3",
      type: "kanji",
      character: "駐",
      onyomi: ["チュウ"],
      kunyomi: [],
      meaning: {
        en: "park vehicles, station troops",
        id: "parkir kendaraan, menempatkan pasukan",
      },
      status: "unverified",
      source: "imported",
      isAiGenerated: false,
      isVerified: false,
      sourceRef: {
        primaryTextbook: "soumatome",
        depthReference: "shinkanzen",
        bookLevel: "n3",
        section: "kanji",
        week: 1,
        day: 1,
        sequence: 1,
      },
    });
  });

  it("parses generated kanji body content", async () => {
    const { items } = await parseRawDataset();
    const item = items.find((entry) => entry.id === "n3-kanji-u99d0");

    expect(item?.body).toContain("**Source:** Soumatome N3 Kanji Week 1 Day 1");
    expect(item?.body).toContain("- 駐車");
  });

  it("parses generated N4 kanji metadata", async () => {
    const { items } = await parseRawDataset();
    const item = items.find((entry) => entry.id === "n4-kanji-u901a");

    expect(item).toMatchObject({
      id: "n4-kanji-u901a",
      curriculumId: "n4_k101",
      level: "n4",
      type: "kanji",
      character: "通",
      onyomi: ["ツウ"],
      kunyomi: ["とおる", "とおす", "かよう"],
      meaning: {
        en: "pass through, commute, attend",
        id: "melewati, berlalu, pergi rutin",
      },
      sourceRef: {
        depthReference: "minna-no-nihongo",
        bookLevel: "n4",
        week: 1,
        day: 1,
      },
    });
  });
});
