import { describe, expect, it } from "vitest";
import type {
  GenerateQuizInput,
  QuizPoolItem,
  QuizType,
} from "../src/modules/dataset/application/types/dataset.type.js";
import {
  buildSystemPrompt,
  buildUserPrompt,
  filterContextForQuizTypes,
} from "../src/modules/dataset/infrastructure/ai/ai-quiz-prompts.js";

const meaningPool = [
  quizPoolItem("n3-kanji-u6307-meaning", "n3-kanji-u6307", "指", {
    onyomi: ["シ"],
    kunyomi: ["ゆび", "さす"],
  }),
  quizPoolItem("n3-kanji-u6b6f-meaning", "n3-kanji-u6b6f", "歯", {
    onyomi: ["シ"],
    kunyomi: ["は"],
  }),
];

describe("ai quiz prompts", () => {
  it("describes compound and reading as AI-generated from meaning-only kanji context", () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain("compound: create a common JLPT word");
    expect(prompt).toContain("reading: create a common JLPT word");
    expect(prompt).toContain("visibly contains context.kanji");
    expect(prompt).toContain("never use a single kanji alone");
    expect(prompt).toContain("kana strings only");
    expect(prompt).toContain("avoid repeating the same answerKey back-to-back");
  });

  it("uses meaning kanji context for compound and reading requests", () => {
    expect(filterContextForQuizTypes(meaningPool, ["compound"])).toEqual(meaningPool);
    expect(filterContextForQuizTypes(meaningPool, ["reading"])).toEqual(meaningPool);
  });

  it("includes kanji readings in the user prompt context", () => {
    const payload = JSON.parse(
      buildUserPrompt(requestInput(["reading"]), meaningPool),
    ) as {
      readonly context: readonly {
        readonly sourceItemId: string;
        readonly kanji: string;
        readonly meaning: { readonly en: string; readonly id: string };
        readonly onyomi: readonly string[];
        readonly kunyomi: readonly string[];
      }[];
    };

    const item = payload.context.find(
      (contextItem) => contextItem.sourceItemId === "n3-kanji-u6307",
    );

    expect(item).toMatchObject({
      sourceItemId: "n3-kanji-u6307",
      kanji: "指",
      meaning: {
        en: "sample meaning",
        id: "contoh arti",
      },
      onyomi: ["シ"],
      kunyomi: ["ゆび", "さす"],
    });
  });

  it("keeps prompt context small for quick AI calls", () => {
    const pool = Array.from({ length: 30 }, (_, index) =>
      quizPoolItem(
        `n3-kanji-${index}-meaning`,
        `n3-kanji-${index}`,
        `字${index}`,
        {},
      ),
    );
    const payload = JSON.parse(buildUserPrompt(requestInput(["reading"]), pool)) as {
      readonly context: readonly unknown[];
    };

    expect(payload.context).toHaveLength(8);
  });
});

function quizPoolItem(
  id: string,
  sourceItemId: string,
  prompt: string,
  metadata: Record<string, unknown>,
): QuizPoolItem {
  return {
    id,
    level: "n3",
    section: "kanji",
    sourceItemId,
    generationMode: "dataset",
    prompt,
    answer: {
      en: "sample meaning",
      id: "contoh arti",
    },
    metadata: {
      quizType: "meaning",
      ...metadata,
    },
  };
}

function requestInput(quizTypes: readonly QuizType[]): GenerateQuizInput {
  return {
    level: "n3",
    section: "kanji",
    count: 1,
    generationMode: "ai_generated",
    quizTypes,
  };
}
