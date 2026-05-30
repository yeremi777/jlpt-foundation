import {
  AI_PROVIDER,
  NODE_ENV,
  OPENAI_API_KEY,
  OPENAI_MODEL,
  OPENROUTER_API_KEY,
  OPENROUTER_APP_TITLE,
  OPENROUTER_HTTP_REFERER,
  OPENROUTER_MODEL,
  OPENROUTER_SERVER_URL,
} from "../../../../common/constant.js";
import type { AiQuizGenerator } from "../../application/ports/ai-quiz-generator.port.js";
import disabledAiQuizGenerator from "./disabled-ai-quiz-generator.js";
import mockAiQuizGenerator from "./mock-ai-quiz-generator.js";
import { OpenAiQuizGenerator } from "./openai-quiz-generator.js";
import { OpenRouterQuizGenerator } from "./openrouter-quiz-generator.js";

export default function createAiQuizGenerator(): AiQuizGenerator {
  if (NODE_ENV === "test") {
    return disabledAiQuizGenerator;
  }

  if (AI_PROVIDER === "mock") {
    return mockAiQuizGenerator;
  }

  if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    return new OpenAiQuizGenerator({
      apiKey: OPENAI_API_KEY,
      model: OPENAI_MODEL,
    });
  }

  if (AI_PROVIDER === "openrouter" && OPENROUTER_API_KEY) {
    return new OpenRouterQuizGenerator({
      apiKey: OPENROUTER_API_KEY,
      appTitle: OPENROUTER_APP_TITLE,
      httpReferer: OPENROUTER_HTTP_REFERER,
      model: OPENROUTER_MODEL,
      serverUrl: OPENROUTER_SERVER_URL,
    });
  }

  return disabledAiQuizGenerator;
}
