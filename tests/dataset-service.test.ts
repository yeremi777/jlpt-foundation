import { describe, expect, it, vi } from "vitest";
import { DatasetService } from "../src/modules/dataset/dataset.service.js";
import type { AiQuizGenerator } from "../src/modules/dataset/application/ports/ai-quiz-generator.port.js";
import type { DatasetRepository } from "../src/modules/dataset/application/ports/dataset-repository.port.js";
import type { QuizPoolItem } from "../src/modules/dataset/application/types/dataset.type.js";

const quizPool: readonly QuizPoolItem[] = [
  {
    id: "n5-kanji-hi-meaning",
    level: "n5",
    section: "kanji",
    sourceItemId: "n5-kanji-hi",
    generationMode: "dataset",
    prompt: "日",
    answer: {
      en: "sun, day",
      id: "matahari, hari",
    },
    metadata: {
      quizType: "meaning",
    },
  },
  {
    id: "n5-kanji-tsuki-meaning",
    level: "n5",
    section: "kanji",
    sourceItemId: "n5-kanji-tsuki",
    generationMode: "dataset",
    prompt: "月",
    answer: {
      en: "moon, month",
      id: "bulan",
    },
    metadata: {
      quizType: "meaning",
    },
  },
];

const repository = {
  getLevels: () => ["n5", "n4", "n3"] as const,
  getKanji: async () => [],
  getKanjiById: async () => undefined,
  getQuizPool: async () => quizPool,
} satisfies DatasetRepository;

describe("DatasetService", () => {
  it("does not call the AI quiz generator for dataset quiz generation", async () => {
    const generateQuiz = vi.fn(async () => {
      throw new Error("AI quiz generator should not be called for dataset mode");
    });
    const aiQuizGenerator = { generateQuiz } satisfies AiQuizGenerator;
    const service = new DatasetService(repository, aiQuizGenerator);

    const quiz = await service.generateQuiz({
      level: "n5",
      section: "kanji",
      count: 1,
      generationMode: "dataset",
      quizTypes: ["meaning"],
    });

    expect(generateQuiz).not.toHaveBeenCalled();
    expect(quiz).toMatchObject({
      level: "n5",
      section: "kanji",
      generationMode: "dataset",
      quizTypes: ["meaning"],
    });
    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0]).toMatchObject({
      section: "kanji",
      generationMode: "dataset",
      quizType: "meaning",
      isAiGenerated: false,
      isVerified: true,
    });
  });
});
