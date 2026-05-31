import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../../../common/errors/app-error.js";
import type { AiQuizGenerator } from "../../application/ports/ai-quiz-generator.port.js";
import type {
  GeneratedQuiz,
  GeneratedQuizQuestion,
  GenerateQuizInput,
  LocalizedText,
  QuizChoiceKey,
  QuizPoolItem,
  QuizType,
  ReadingQuizChoice,
} from "../../application/types/dataset.type.js";
import { filterContextForQuizTypes } from "./ai-quiz-prompts.js";
import {
  buildAiQuizNormalizationContext,
  formatReadingPrompt,
} from "./ai-quiz-response.js";

export default {
  async generateQuiz(
    input: GenerateQuizInput,
    context: readonly QuizPoolItem[],
  ): Promise<GeneratedQuiz> {
    if (context.length === 0) {
      throw new BadRequestError("No quiz context found for the requested filters.");
    }

    const normalizationContext = buildAiQuizNormalizationContext(context);
    const questions = Array.from({ length: input.count }, (_, index) =>
      createMockQuestion(input, context, index, normalizationContext),
    );

    return {
      id: randomUUID(),
      level: input.level,
      section: input.section,
      generationMode: "ai_generated",
      quizTypes: input.quizTypes,
      questions,
    };
  },
} satisfies AiQuizGenerator;

function createMockQuestion(
  input: GenerateQuizInput,
  context: readonly QuizPoolItem[],
  index: number,
  normalizationContext: ReturnType<typeof buildAiQuizNormalizationContext>,
): GeneratedQuizQuestion {
  const quizType = input.quizTypes[index % input.quizTypes.length] ?? "meaning";
  const scopedContext = filterContextForQuizTypes(context, [quizType]);
  const candidates = findCandidates(scopedContext, quizType);
  const item = candidates[index % candidates.length];

  if (quizType === "reading") {
    return createMockReadingQuestion(input, item, index, normalizationContext);
  }

  return createMockLocalizedQuestion(input, item, index, candidates, quizType);
}

function createMockReadingQuestion(
  input: GenerateQuizInput,
  item: QuizPoolItem,
  index: number,
  normalizationContext: ReturnType<typeof buildAiQuizNormalizationContext>,
): GeneratedQuizQuestion {
  const compoundReading = asOptionalString(item.metadata.reading);
  const answer = compoundReading ?? createMockReading(item.prompt);
  const distractors = shuffleItems(
    normalizationContext.contextReadings.filter((reading) => reading !== answer),
  ).slice(0, 3);
  const choices = buildReadingChoices(answer, distractors);
  const correctChoice = choices.find((choice) => choice.answer === answer);

  return {
    id: `mock-ai-${item.id}-q${index + 1}`,
    sourceItemId: item.sourceItemId,
    section: input.section,
    prompt: formatReadingPrompt(item.prompt),
    choices,
    answerKey: correctChoice?.key ?? "A",
    answer,
    generationMode: "ai_generated",
    quizType: "reading",
    isAiGenerated: true,
    isVerified: false,
  };
}

function createMockLocalizedQuestion(
  input: GenerateQuizInput,
  item: QuizPoolItem,
  index: number,
  candidates: readonly QuizPoolItem[],
  quizType: "meaning" | "compound",
): GeneratedQuizQuestion {
  const answer = item.answer;
  const distractors = shuffleItems(
    candidates
      .filter((candidate) => candidate.id !== item.id)
      .map((candidate) => candidate.answer),
  ).slice(0, 3);
  const choices = createLocalizedChoices(answer, distractors);
  const correctChoice = choices.find((choice) =>
    isSameAnswer(choice.answer, answer),
  );

  return {
    id: `mock-ai-${item.id}-q${index + 1}`,
    sourceItemId: item.sourceItemId,
    section: input.section,
    prompt: item.prompt,
    choices,
    answerKey: correctChoice?.key ?? "A",
    answer,
    generationMode: "ai_generated",
    quizType,
    isAiGenerated: true,
    isVerified: false,
  };
}

function findCandidates(
  context: readonly QuizPoolItem[],
  quizType: QuizType,
): readonly QuizPoolItem[] {
  const candidates = context.filter((item) => item.metadata.quizType === quizType);

  if (candidates.length > 0) {
    return candidates;
  }

  if (quizType === "reading") {
    const compoundCandidates = context.filter(
      (item) => item.metadata.quizType === "compound",
    );
    if (compoundCandidates.length > 0) {
      return compoundCandidates;
    }
  }

  return context.filter((item) => item.metadata.quizType === "meaning");
}

function createMockReading(prompt: string): string {
  const readings = new Map<string, string>([
    ["先生", "せんせい"],
    ["学生", "がくせい"],
    ["来年", "らいねん"],
    ["今日", "きょう"],
    ["日本", "にほん"],
    ["電車", "でんしゃ"],
  ]);

  return readings.get(prompt) ?? "もっく";
}

function buildReadingChoices(
  answer: string,
  distractors: readonly string[],
): ReadingQuizChoice[] {
  const keys: QuizChoiceKey[] = ["A", "B", "C", "D"];
  const fallbackDistractors = ["あい", "うえ", "かき"];
  const readings = shuffleItems([
    answer,
    ...distractors,
    ...fallbackDistractors,
  ]).slice(0, 4);

  return readings.map((reading, index) => ({
    key: keys[index] ?? "D",
    answer: reading,
  }));
}

function createLocalizedChoices(
  answer: LocalizedText,
  distractors: readonly LocalizedText[],
) {
  const fallbackDistractors = [
    { en: "mock-a", id: "mock-a" },
    { en: "mock-b", id: "mock-b" },
    { en: "mock-c", id: "mock-c" },
  ];
  const answers = [answer, ...distractors, ...fallbackDistractors].slice(0, 4);

  return shuffleItems(answers).map((choice, index) => ({
    key: toChoiceKey(index),
    answer: choice,
  }));
}

function shuffleItems<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function toChoiceKey(index: number): QuizChoiceKey {
  const keys = ["A", "B", "C", "D"] as const;
  return keys[index] ?? "D";
}

function isSameAnswer(first: LocalizedText, second: LocalizedText): boolean {
  return first.en === second.en && first.id === second.id;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
