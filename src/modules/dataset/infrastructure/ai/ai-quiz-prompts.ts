import type { GenerateQuizInput, QuizPoolItem, QuizType } from "../../application/types/dataset.type.js";

interface PromptContextItem {
  readonly sourceItemId: string;
  readonly prompt: string;
  readonly answer?: { readonly en: string; readonly id: string };
  readonly metadata: {
    readonly quizType?: unknown;
  };
}

export function buildSystemPrompt(): string {
  return [
    "Generate JLPT kanji quizzes from the dataset context. Return raw JSON only (no markdown fences).",
    "meaning: prompt is only the kanji character from context.prompt (example: 期). Never add parentheses, readings, onyomi, or kunyomi. choices[].answer and answer are {en,id} with English in en and Indonesian in id only.",
    "compound: prompt is only the compound word from context.prompt (example: 了解). Never add parentheses or readings. choices[].answer and answer are {en,id} with English in en and Indonesian in id only.",
    "reading: prompt is context.prompt plus （　　）. choices[].answer and answer must be hiragana or katakana strings only. Never use romaji. Never use {en,id}.",
    "Use exactly four choices A-D, randomize answerKey, and duplicate answer from the correct choice.",
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
    rules: [
      "Use only sourceItemId values from context.",
      "Meaning and compound prompts must equal context.prompt exactly (kanji or compound word only, no （）).",
      "For meaning and compound, copy choice meanings from context.answer style: en=English, id=Indonesian.",
      "For reading, use kana only (example: じっさいに). Forbidden: jissaini, {en,id}, English, Indonesian.",
    ],
    context: selectPromptContext(context, input.quizTypes, input.count),
  });
}

function selectPromptContext(
  context: readonly QuizPoolItem[],
  quizTypes: readonly QuizType[],
  count: number,
): readonly PromptContextItem[] {
  const filtered = filterContextForQuizTypes(context, quizTypes);
  const limit = Math.min(Math.max(count * 4, 20), 60);

  return shuffleItems(filtered)
    .slice(0, limit)
    .map((item) => ({
      sourceItemId: item.sourceItemId,
      prompt: item.prompt,
      answer:
        item.metadata.quizType === "meaning" ||
        item.metadata.quizType === "compound"
          ? item.answer
          : undefined,
      metadata: {
        quizType: item.metadata.quizType,
      },
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
    const compounds = context.filter(
      (item) =>
        item.metadata.quizType === "compound" &&
        Array.from(item.prompt).length >= 2,
    );

    return compounds.length > 0 ? compounds : context;
  }

  if (quizType === "compound") {
    return context.filter((item) => item.metadata.quizType === "compound");
  }

  return context;
}

function shuffleItems<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
