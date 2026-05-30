import {
  clientErrorResponseSchema,
  serverErrorResponseSchema,
  successArrayResponseSchema,
  successResponseSchema,
} from "../../../../common/responses/http-response.schema.js";

const levelSchema = {
  type: "string",
  enum: ["n5", "n4", "n3"],
} as const;

const localizedTextSchema = {
  type: "object",
  properties: {
    en: { type: "string" },
    id: { type: "string" },
  },
  required: ["en", "id"],
} as const;

const sourceRefSchema = {
  type: "object",
  properties: {
    primaryTextbook: { type: "string" },
    depthReference: { type: "string" },
    bookLevel: { type: "string" },
    section: { type: "string" },
    week: { type: "integer" },
    day: { type: "integer" },
    sequence: { type: "integer" },
  },
} as const;

const kanjiItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    level: levelSchema,
    type: { type: "string", enum: ["kanji"] },
    character: { type: "string" },
    meaning: localizedTextSchema,
    onyomi: { type: "array", items: { type: "string" } },
    kunyomi: { type: "array", items: { type: "string" } },
    examples: { type: "array", items: { type: "string" } },
    source: { type: "string" },
    week: { type: "integer" },
    day: { type: "integer" },
    weekTitle: { type: "string" },
    dayTitle: { type: "string" },
    sequence: { type: "integer" },
    sourceRef: sourceRefSchema,
  },
  required: ["id", "level", "type", "character", "meaning", "onyomi", "kunyomi", "examples"],
} as const;

const quizPoolItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    level: levelSchema,
    section: { type: "string", enum: ["kanji", "vocab", "grammar"] },
    prompt: { type: "string" },
    answer: localizedTextSchema,
    generationMode: { type: "string", enum: ["dataset", "ai_generated"] },
    sourceItemId: { type: "string" },
    metadata: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: ["id", "level", "section", "sourceItemId", "generationMode", "prompt", "answer"],
} as const;

export const listLevelsRouteSchema = {
  tags: ["Dataset"],
  summary: "List supported JLPT levels",
  description: "Returns the levels currently supported by the dataset foundation.",
  response: {
    200: successResponseSchema({
      type: "array",
      items: levelSchema,
    }),
  },
} as const;

export const listKanjiRouteSchema = {
  tags: ["Dataset"],
  summary: "List kanji items",
  description: "Returns kanji items by JLPT level, with optional curriculum week and day filters.",
  querystring: {
    type: "object",
    properties: {
      level: {
        type: "string",
        description: "Supported values: n5, n4, n3.",
      },
      week: { type: "string", description: "Positive curriculum week number." },
      day: { type: "string", description: "Positive curriculum day number." },
    },
  },
  response: {
    200: successArrayResponseSchema(kanjiItemSchema),
    400: clientErrorResponseSchema("Invalid request"),
    500: serverErrorResponseSchema(),
  },
} as const;

export const getKanjiByIdRouteSchema = {
  tags: ["Dataset"],
  summary: "Get kanji item by ID",
  description: "Returns one kanji item by its stable dataset ID.",
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
  response: {
    200: successResponseSchema(kanjiItemSchema),
    404: clientErrorResponseSchema("Resource not found"),
    500: serverErrorResponseSchema(),
  },
} as const;

export const listQuizPoolRouteSchema = {
  tags: ["Quiz"],
  summary: "List quiz pool items",
  description: "Returns dataset-backed quiz pool items. AI-generated quiz modes will be added later.",
  querystring: {
    type: "object",
    properties: {
      level: {
        type: "string",
        description: "Supported values: n5, n4, n3.",
      },
      section: {
        type: "string",
        description: "Optional section filter. Supported values: kanji, vocab, grammar.",
      },
    },
  },
  response: {
    200: successArrayResponseSchema(quizPoolItemSchema),
    400: clientErrorResponseSchema("Invalid request"),
    500: serverErrorResponseSchema(),
  },
} as const;
