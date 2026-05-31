import type { GenerateQuizInput, QuizPoolItem, QuizType } from "../../application/types/dataset.type.js";

interface PromptContextItem {
  readonly sourceItemId: string;
  readonly kanji: string;
  readonly meaning?: { readonly en: string; readonly id: string };
  readonly onyomi?: unknown;
  readonly kunyomi?: unknown;
}

export function buildSystemPrompt(): string {
  return [
    "Return raw JSON only.",
    "Use only sourceItemId values from context.",
    "meaning: prompt equals context.kanji; answer/choices are {en,id}; correct answer uses context.meaning.",
    "compound: create a common JLPT word using context.kanji; prompt is only the word; answer/choices are that word's {en,id} meaning.",
    "reading: create a common JLPT word using context.kanji; prompt is word + （　　）; answer/choices are standard dictionary kana strings only, never romaji or {en,id}.",
    "Each question has exactly four unique choices A-D and answer duplicates the answerKey choice.",
  ].join(" ");
}

export function buildUserPrompt(
  input: GenerateQuizInput,
  context: readonly QuizPoolItem[],
): string {
  return JSON.stringify({
    level: input.level,
    section: input.section,
    quizTypes: input.quizTypes,
    count: input.count,
    rules:
      "Context is meaning-only kanji data. For compound/reading, generate a real word from kanji; do not answer with the single-kanji meaning unless it is truly correct for that word. All choices must be unique.",
    context: selectPromptContext(context, input.quizTypes, input.count),
  });
}

function selectPromptContext(
  context: readonly QuizPoolItem[],
  quizTypes: readonly QuizType[],
  count: number,
): readonly PromptContextItem[] {
  const filtered = filterContextForQuizTypes(context, quizTypes);
  const limit = Math.min(Math.max(count * 3, 8), 24);

  return shuffleItems(filtered)
    .slice(0, limit)
    .map((item) => ({
      sourceItemId: item.sourceItemId,
      kanji: item.prompt,
      meaning: item.metadata.quizType === "meaning" ? item.answer : undefined,
      onyomi: item.metadata.onyomi,
      kunyomi: item.metadata.kunyomi,
    }));
}

export function filterContextForQuizTypes(
  context: readonly QuizPoolItem[],
  quizTypes: readonly QuizType[],
): readonly QuizPoolItem[] {
  if (quizTypes.length !== 1) {
    return context;
  }

  const [quizType] = quizTypes;

  if (quizType === "meaning") {
    return context.filter((item) => item.metadata.quizType === "meaning");
  }

  if (quizType === "reading") {
    return context.filter((item) => item.metadata.quizType === "meaning");
  }

  if (quizType === "compound") {
    return context.filter((item) => item.metadata.quizType === "meaning");
  }

  return context;
}

function shuffleItems<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
