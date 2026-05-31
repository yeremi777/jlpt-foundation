import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { BadRequestError } from "../../../../common/errors/app-error.js";
import type { AiQuizGenerator } from "../../application/ports/ai-quiz-generator.port.js";
import type {
  GeneratedQuiz,
  GenerateQuizInput,
  QuizPoolItem,
} from "../../application/types/dataset.type.js";
import { buildSystemPrompt, buildUserPrompt } from "./ai-quiz-prompts.js";
import {
  buildAiQuizNormalizationContext,
  buildAiQuizOutputSchema,
  mapAiQuizQuestionsToGenerated,
  parseAiQuizQuestionsPayload,
} from "./ai-quiz-response.js";
import { withExtraAiCandidates } from "./ai-quiz-request.js";

interface OpenAiQuizGeneratorOptions {
  readonly apiKey: string;
  readonly model: string;
}

export class OpenAiQuizGenerator implements AiQuizGenerator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAiQuizGeneratorOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
  }

  async generateQuiz(
    input: GenerateQuizInput,
    context: readonly QuizPoolItem[],
  ): Promise<GeneratedQuiz> {
    if (context.length === 0) {
      throw new BadRequestError(
        "No quiz context found for the requested filters.",
      );
    }

    const normalizationContext = buildAiQuizNormalizationContext(context);
    const promptInput = withExtraAiCandidates(input);

    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: buildUserPrompt(promptInput, context),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "jlpt_generated_quiz",
          strict: true,
          schema: buildAiQuizOutputSchema(input.quizTypes),
        },
      },
    });

    const payload = parseAiQuizQuestionsPayload(response.output_text);
    const mapped = mapAiQuizQuestionsToGenerated(payload.questions, input, {
      idPrefix: "ai",
      normalizationContext,
    });

    return {
      id: randomUUID(),
      level: input.level,
      section: input.section,
      generationMode: "ai_generated",
      quizTypes: input.quizTypes,
      questions: mapped.questions,
      ...(mapped.skippedInvalidQuestions > 0
        ? { skippedInvalidQuestions: mapped.skippedInvalidQuestions }
        : {}),
    };
  }
}
