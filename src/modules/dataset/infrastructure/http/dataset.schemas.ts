import {
  clientErrorResponseSchema,
  paginatedArrayResponseSchema,
  serverErrorResponseSchema,
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

const localizedQuizChoiceSchema = {
  type: "object",
  properties: {
    key: { type: "string", enum: ["A", "B", "C", "D"] },
    answer: localizedTextSchema,
  },
  required: ["key", "answer"],
} as const;

const readingQuizChoiceSchema = {
  type: "object",
  properties: {
    key: { type: "string", enum: ["A", "B", "C", "D"] },
    answer: { type: "string" },
  },
  required: ["key", "answer"],
} as const;

const generatedQuizQuestionBaseSchema = {
  id: { type: "string" },
  sourceItemId: { type: "string" },
  section: { type: "string", enum: ["kanji", "vocab", "grammar"] },
  prompt: { type: "string" },
  answerKey: { type: "string", enum: ["A", "B", "C", "D"] },
  generationMode: { type: "string", enum: ["dataset", "ai_generated"] },
  isAiGenerated: { type: "boolean" },
  isVerified: { type: "boolean" },
} as const;

const generatedQuizQuestionBaseRequired = [
  "id",
  "sourceItemId",
  "section",
  "prompt",
  "choices",
  "answerKey",
  "answer",
  "generationMode",
  "quizType",
  "isAiGenerated",
  "isVerified",
] as const;

const localizedGeneratedQuizQuestionSchema = {
  type: "object",
  properties: {
    ...generatedQuizQuestionBaseSchema,
    quizType: { type: "string", enum: ["meaning", "compound"] },
    choices: {
      type: "array",
      items: localizedQuizChoiceSchema,
    },
    answer: localizedTextSchema,
  },
  required: generatedQuizQuestionBaseRequired,
} as const;

const readingGeneratedQuizQuestionSchema = {
  type: "object",
  properties: {
    ...generatedQuizQuestionBaseSchema,
    quizType: { type: "string", enum: ["reading"] },
    choices: {
      type: "array",
      items: readingQuizChoiceSchema,
    },
    answer: { type: "string" },
  },
  required: generatedQuizQuestionBaseRequired,
} as const;

const generatedQuizQuestionSchema = {
  oneOf: [localizedGeneratedQuizQuestionSchema, readingGeneratedQuizQuestionSchema],
} as const;

const generatedQuizSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    level: levelSchema,
    section: { type: "string", enum: ["kanji", "vocab", "grammar"] },
    generationMode: { type: "string", enum: ["dataset", "ai_generated"] },
    quizTypes: {
      type: "array",
      items: { type: "string", enum: ["meaning", "reading", "compound"] },
    },
    questions: {
      type: "array",
      items: generatedQuizQuestionSchema,
    },
  },
  required: ["id", "level", "section", "generationMode", "quizTypes", "questions"],
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
      page: { type: "string", description: "Positive page number. Defaults to 1." },
      size: { type: "string", description: "Positive page size. Defaults to 10, maximum 100." },
    },
  },
  response: {
    200: paginatedArrayResponseSchema(kanjiItemSchema),
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
      page: { type: "string", description: "Positive page number. Defaults to 1." },
      size: { type: "string", description: "Positive page size. Defaults to 10, maximum 100." },
    },
  },
  response: {
    200: paginatedArrayResponseSchema(quizPoolItemSchema),
    400: clientErrorResponseSchema("Invalid request"),
    500: serverErrorResponseSchema(),
  },
} as const;

export const generateQuizRouteSchema = {
  tags: ["Quiz"],
  summary: "Generate dataset-backed quiz",
  description:
    "Generates a randomized quiz. Dataset generation supports meaning quizzes only. AI generation is part of the contract now, but requires a configured AI provider before it can return quiz content.",
  body: {
    type: "object",
    properties: {
      level: levelSchema,
      section: { type: "string", enum: ["kanji", "vocab", "grammar"] },
      count: { type: "integer", minimum: 1, maximum: 50 },
      generationMode: { type: "string", enum: ["dataset", "ai_generated"] },
      quizType: {
        type: "array",
        items: { type: "string", enum: ["meaning", "reading", "compound"] },
        minItems: 1,
        uniqueItems: true,
        description:
          "Requested quiz types. Dataset generation narrows this to meaning only. AI generation may request meaning, reading, compound, or any combination.",
      },
    },
    required: ["level", "section", "count"],
  },
  response: {
    200: successResponseSchema(generatedQuizSchema),
    400: clientErrorResponseSchema("Invalid request"),
    501: serverErrorResponseSchema("AI quiz generation is not configured yet."),
    500: serverErrorResponseSchema(),
  },
} as const;
