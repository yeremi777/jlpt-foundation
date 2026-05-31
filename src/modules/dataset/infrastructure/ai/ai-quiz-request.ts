import type { GenerateQuizInput } from "../../application/types/dataset.type.js";

export function withExtraAiCandidates(
  input: GenerateQuizInput,
): GenerateQuizInput {
  if (!input.quizTypes.includes("reading")) {
    return input;
  }

  return {
    ...input,
    count: Math.min(input.count + 3, 50),
  };
}
