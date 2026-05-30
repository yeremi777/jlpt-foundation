import { randomUUID } from "node:crypto";
import { OpenRouter } from "@openrouter/sdk";
import {
  BadRequestError,
  GatewayTimeoutError,
} from "../../../../common/errors/app-error.js";
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
  mapAiQuizQuestionToGenerated,
  parseAiQuizQuestionsPayload,
} from "./ai-quiz-response.js";

interface OpenRouterQuizGeneratorOptions {
  readonly apiKey: string;
  readonly appTitle: string;
  readonly httpReferer: string;
  readonly model: string;
  readonly serverUrl: string;
}

export class OpenRouterQuizGenerator implements AiQuizGenerator {
  private readonly client: OpenRouter;
  private readonly model: string;

  constructor(options: OpenRouterQuizGeneratorOptions) {
    this.client = new OpenRouter({
      apiKey: options.apiKey,
      appTitle: options.appTitle,
      httpReferer: options.httpReferer,
      serverURL: options.serverUrl,
    });
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

    let response;
    try {
      response = await this.client.chat.send({
        chatRequest: {
          model: this.model,
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(),
            },
            {
              role: "user",
              content: buildUserPrompt(input, context),
            },
          ],
          responseFormat: {
            type: "json_schema",
            jsonSchema: {
              name: "jlpt_openrouter_generated_quiz",
              strict: true,
              schema: buildAiQuizOutputSchema(input.quizTypes),
            },
          },
          stream: false,
        },
      });
    } catch (error) {
      throw mapOpenRouterQuizError(error);
    }

    console.log("OpenRouter response:", response.choices[0]?.message);

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new BadRequestError("OpenRouter quiz response was empty.");
    }

    const payload = parseAiQuizQuestionsPayload(content);

    return {
      id: randomUUID(),
      level: input.level,
      section: input.section,
      generationMode: "ai_generated",
      quizTypes: input.quizTypes,
      questions: payload.questions
        .slice(0, input.count)
        .map((question, index) =>
          mapAiQuizQuestionToGenerated(question, input, index, {
            idPrefix: "openrouter",
            normalizationContext,
          }),
        ),
    };
  }
}

function mapOpenRouterQuizError(error: unknown): Error {
  if (typeof error !== "object" || error === null) {
    return error instanceof Error ? error : new Error(String(error));
  }

  const candidate = error as {
    readonly name?: string;
    readonly body?: string;
  };

  if (candidate.name === "ResponseValidationError") {
    const body = candidate.body ?? "";

    if (body.includes('"code":504') || body.includes("operation was aborted")) {
      return new GatewayTimeoutError(
        "AI quiz generation timed out. Try fewer questions or retry.",
      );
    }

    return new BadRequestError("OpenRouter returned an unexpected response.");
  }

  return error instanceof Error ? error : new Error(String(error));
}
