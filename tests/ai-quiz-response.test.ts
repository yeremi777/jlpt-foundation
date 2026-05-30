import { describe, expect, it } from "vitest";
import type {
  GenerateQuizInput,
  LocalizedText,
  QuizPoolItem,
  QuizType,
} from "../src/modules/dataset/application/types/dataset.type.js";
import {
  buildAiQuizNormalizationContext,
  formatLocalizedPrompt,
  formatReadingPrompt,
  mapAiQuizQuestionToGenerated,
} from "../src/modules/dataset/infrastructure/ai/ai-quiz-response.js";

const meaningPool = [
  quizPoolItem("n3-kanji-u6307-meaning", "n3-kanji-u6307", "指", {
    en: "finger",
    id: "jari",
  }),
  quizPoolItem("n3-kanji-u671f-meaning", "n3-kanji-u671f", "期", {
    en: "period, term, time, season",
    id: "periode, jangka waktu, musim",
  }),
  quizPoolItem("n3-kanji-u7ba1-meaning", "n3-kanji-u7ba1", "管", {
    en: "pipe, tube, control",
    id: "pipa, tabung, mengontrol",
  }),
  quizPoolItem("n3-kanji-u6a5f-meaning", "n3-kanji-u6a5f", "機", {
    en: "machine, opportunity",
    id: "mesin, kesempatan",
  }),
];

const compoundPool = [
  quizPoolItem(
    "n3-kanji-u4e86-compound-1",
    "n3-kanji-u4e86",
    "了解",
    { en: "understanding, agreement", id: "pemahaman, persetujuan" },
    { quizType: "compound", reading: "りょうかい" },
  ),
  quizPoolItem(
    "n3-kanji-u4e86-compound-2",
    "n3-kanji-u4e86",
    "了承",
    { en: "acknowledgement, consent", id: "pengakuan, persetujuan" },
    { quizType: "compound", reading: "りょうしょう" },
  ),
  quizPoolItem(
    "n3-kanji-u4e86-compound-3",
    "n3-kanji-u4e86",
    "了解する",
    { en: "to understand, to consent", id: "memahami, menyetujui" },
    { quizType: "compound", reading: "りょうかいする" },
  ),
  quizPoolItem(
    "n3-kanji-u7d50-compound-1",
    "n3-kanji-u7d50",
    "結構",
    { en: "quite, fine, structure", id: "cukup, bagus, struktur" },
    { quizType: "compound", reading: "けっこう" },
  ),
];

describe("ai quiz response", () => {
  it("formats prompts for each quiz type", () => {
    expect(formatLocalizedPrompt("meaning", "指（シ、ゆび）")).toBe("指");
    expect(formatLocalizedPrompt("compound", "了解（りょうかい）")).toBe("了解");
    expect(formatReadingPrompt("速い (　　)（　　）")).toBe("速い（　　）");
  });

  it("rebuilds meaning answers from dataset values", () => {
    const question = mapAiQuizQuestionToGenerated(
      {
        sourceItemId: "n3-kanji-u6307",
        prompt: "指（シ、ゆび）",
        quizType: "meaning",
        choices: [
          { key: "A", answer: { en: "ゆび", id: "jari" } },
          { key: "B", answer: { en: "finger", id: "jari" } },
          { key: "C", answer: { en: "hand", id: "tangan" } },
          { key: "D", answer: { en: "arm", id: "lengan" } },
        ],
        answerKey: "A",
        answer: { en: "ゆび", id: "jari" },
      },
      requestInput("meaning"),
      0,
      {
        idPrefix: "test",
        normalizationContext: buildAiQuizNormalizationContext(meaningPool),
      },
    );

    if (question.quizType !== "meaning") {
      throw new Error("expected meaning question");
    }

    expect(question.prompt).toBe("指");
    expect(question.answer).toEqual(meaningPool[0]?.answer);
    assertLocalizedAnswers(question.answer, question.choices.map((choice) => choice.answer));
  });

  it("rebuilds compound answers from dataset values", () => {
    const question = mapAiQuizQuestionToGenerated(
      {
        sourceItemId: "n3-kanji-u4e86",
        prompt: "了解（りょうかい）",
        quizType: "compound",
        choices: [
          { key: "A", answer: { en: "つなぐ", id: "mengikat" } },
          { key: "B", answer: { en: "あかす", id: "menyimpulkan" } },
          { key: "C", answer: { en: "結ぶ", id: "mengikat" } },
          { key: "D", answer: { en: "結び", id: "mengikat" } },
        ],
        answerKey: "A",
        answer: { en: "mengikat", id: "mengikat" },
      },
      requestInput("compound"),
      0,
      {
        idPrefix: "test",
        normalizationContext: buildAiQuizNormalizationContext(compoundPool),
      },
    );

    if (question.quizType !== "compound") {
      throw new Error("expected compound question");
    }

    expect(question.prompt).toBe("了解");
    expect(question.answer).toEqual(compoundPool[0]?.answer);
    assertLocalizedAnswers(question.answer, question.choices.map((choice) => choice.answer));
  });

  it("repairs bad reading output from dataset metadata", () => {
    const question = mapAiQuizQuestionToGenerated(
      {
        sourceItemId: "n3-kanji-u4e86",
        prompt: "了解",
        quizType: "reading",
        choices: [
          { key: "A", answer: "りょうかい" },
          { key: "B", answer: "ta" },
          { key: "C", answer: "りょかい" },
          { key: "D", answer: "ba" },
        ],
        answerKey: "B",
        answer: "ta",
      },
      requestInput("reading"),
      0,
      {
        idPrefix: "test",
        normalizationContext: buildAiQuizNormalizationContext(compoundPool),
      },
    );

    if (question.quizType !== "reading") {
      throw new Error("expected reading question");
    }

    expect(question.prompt).toBe("了解（　　）");
    expect(question.answer).toBe("りょうかい");
    expect(question.choices.every((choice) => isKanaOnly(choice.answer))).toBe(true);
  });

  it("rejects duplicate reading choices when no dataset reading exists", () => {
    const context = buildAiQuizNormalizationContext([
      quizPoolItem(
        "n3-kanji-u5dee-compound-3",
        "n3-kanji-u5dee",
        "差出人",
        { en: "sender", id: "pengirim" },
        { quizType: "compound" },
      ),
    ]);

    expect(() =>
      mapAiQuizQuestionToGenerated(
        {
          sourceItemId: "n3-kanji-u5dee",
          prompt: "差出人 (　　)（　　）",
          quizType: "reading",
          choices: [
            { key: "A", answer: "さしでん" },
            { key: "B", answer: "さしでん" },
            { key: "C", answer: "さしでん" },
            { key: "D", answer: "さしでん" },
          ],
          answerKey: "C",
          answer: "さしでん",
        },
        requestInput("reading"),
        0,
        { idPrefix: "test", normalizationContext: context },
      ),
    ).toThrow("Reading quiz generation failed");
  });
});

function quizPoolItem(
  id: string,
  sourceItemId: string,
  prompt: string,
  answer: LocalizedText,
  metadata: Record<string, unknown> = { quizType: "meaning" },
): QuizPoolItem {
  return {
    id,
    level: "n3",
    section: "kanji",
    sourceItemId,
    generationMode: "dataset",
    prompt,
    answer,
    metadata,
  };
}

function requestInput(quizType: QuizType): GenerateQuizInput {
  return {
    level: "n3",
    section: "kanji",
    count: 1,
    generationMode: "ai_generated",
    quizTypes: [quizType],
  };
}

function assertLocalizedAnswers(
  answer: LocalizedText,
  choices: readonly LocalizedText[],
): void {
  for (const localized of [answer, ...choices]) {
    expect(localized.en).toMatch(/[A-Za-z]/);
    expect(localized.en).not.toMatch(KANA_OR_KANJI_PATTERN);
    expect(localized.id).not.toMatch(KANA_OR_KANJI_PATTERN);
    expect(localized.en).not.toBe(localized.id);
    expect(localized.en.startsWith("mock-")).toBe(false);
    expect(localized.id.startsWith("mock-")).toBe(false);
  }
}

function isKanaOnly(value: string): boolean {
  return /[぀-ゟ゠-ヿ]/.test(value) && !/[A-Za-z]/.test(value);
}

const KANA_OR_KANJI_PATTERN = /[぀-ゟ゠-ヿ一-鿿]/;
