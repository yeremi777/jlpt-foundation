import { randomUUID } from "node:crypto";
import type {
  GeneratedQuiz,
  GeneratedQuizQuestion,
  GenerateQuizInput,
  LocalizedText,
  QuizPoolItem,
} from "../../application/types/dataset.type.js";

export function generateDatasetQuiz(
  input: GenerateQuizInput,
  candidates: readonly QuizPoolItem[],
): GeneratedQuiz {
  const supportedCandidates = candidates.filter(isDatasetMeaningCandidate);
  const selectedItems = shuffleItems(supportedCandidates).slice(0, input.count);

  return {
    id: randomUUID(),
    level: input.level,
    section: input.section,
    generationMode: input.generationMode,
    quizTypes: ["meaning"],
    questions: selectedItems.map((item, index) =>
      createDatasetQuestion(item, index, supportedCandidates),
    ),
  };
}

function isDatasetMeaningCandidate(item: QuizPoolItem): boolean {
  if (item.metadata.quizType !== "meaning") {
    return false;
  }

  if (item.section === "kanji") {
    return Array.from(item.prompt).length === 1;
  }

  return true;
}

function createDatasetQuestion(
  item: QuizPoolItem,
  index: number,
  candidates: readonly QuizPoolItem[],
): GeneratedQuizQuestion {
  const distractors = shuffleItems(
    candidates.filter((candidate) => candidate.id !== item.id),
  )
    .slice(0, 3)
    .map((candidate) => candidate.answer);
  const choices = shuffleItems([item.answer, ...distractors])
    .slice(0, 4)
    .map((answer, choiceIndex) => ({
      key: toChoiceKey(choiceIndex),
      answer,
    }));
  const correctChoice = choices.find((choice) =>
    isSameAnswer(choice.answer, item.answer),
  );

  return {
    id: `${item.id}-q${index + 1}`,
    sourceItemId: item.sourceItemId,
    section: item.section,
    prompt: item.prompt,
    choices,
    answerKey: correctChoice?.key ?? "A",
    answer: item.answer,
    generationMode: "dataset",
    quizType: "meaning",
    isAiGenerated: false,
    isVerified: true,
  };
}

function shuffleItems<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function toChoiceKey(index: number): "A" | "B" | "C" | "D" {
  const keys = ["A", "B", "C", "D"] as const;
  return keys[index] ?? "D";
}

function isSameAnswer(first: LocalizedText, second: LocalizedText): boolean {
  return first.en === second.en && first.id === second.id;
}
