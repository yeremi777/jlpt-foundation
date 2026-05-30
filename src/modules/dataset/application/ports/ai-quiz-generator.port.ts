import type {
  GeneratedQuiz,
  GenerateQuizInput,
  QuizPoolItem,
} from "../types/dataset.type.js";

export interface AiQuizGenerator {
  generateQuiz(
    input: GenerateQuizInput,
    context: readonly QuizPoolItem[],
  ): Promise<GeneratedQuiz>;
}
