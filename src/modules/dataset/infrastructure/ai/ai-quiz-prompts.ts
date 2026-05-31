import type {
  GenerateQuizInput,
  QuizPoolItem,
  QuizType,
} from "../../application/types/dataset.type.js";

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
    "compound: create a common JLPT word that visibly contains context.kanji; prompt is only the word; answer/choices are that word's {en,id} meaning.",
    "reading: create a common JLPT word that visibly contains context.kanji; never use a single kanji alone; prompt is word + （　　）; answer/choices must be kana-only readings in hiragana or katakana, never kanji, romaji, English, Indonesian, or {en,id}.",
    "Each question has exactly four unique choices A-D and answer duplicates the answerKey choice.",
    "When generating multiple questions, vary answerKey across A-D and avoid repeating the same answerKey back-to-back when possible.",
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
      "Context is meaning-only kanji data. For compound/reading, generated prompt word must contain context.kanji; do not use single-kanji reading prompts; if unsure choose another word. For reading, answer and choices must be kana-only readings of the prompt word, not kanji word forms or conjugations. All choices must be unique.",
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
