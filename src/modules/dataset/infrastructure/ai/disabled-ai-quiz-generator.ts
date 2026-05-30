import { NotImplementedError } from "../../../../common/errors/app-error.js";
import type { AiQuizGenerator } from "../../application/ports/ai-quiz-generator.port.js";

export default {
  async generateQuiz() {
    throw new NotImplementedError(
      "AI quiz generation is not configured yet.",
    );
  },
} satisfies AiQuizGenerator;
