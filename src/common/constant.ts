import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:3000";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "error";

export const AI_PROVIDER = process.env.AI_PROVIDER ?? "mock";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "openrouter/free";
export const OPENROUTER_SERVER_URL =
  process.env.OPENROUTER_SERVER_URL ?? "https://openrouter.ai/api/v1";
export const OPENROUTER_APP_TITLE =
  process.env.OPENROUTER_APP_TITLE ?? "JLPT Foundation";
export const OPENROUTER_HTTP_REFERER =
  process.env.OPENROUTER_HTTP_REFERER ?? APP_URL;
