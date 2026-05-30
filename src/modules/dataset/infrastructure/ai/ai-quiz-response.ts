import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../../../common/errors/app-error.js";
import type {
  GeneratedQuizQuestion,
  GenerateQuizInput,
  LocalizedText,
  QuizChoiceKey,
  QuizPoolItem,
  QuizType,
  ReadingQuizChoice,
} from "../../application/types/dataset.type.js";

export interface AiRawQuizQuestion {
  readonly sourceItemId: string;
  readonly prompt: string;
  readonly quizType: QuizType;
  readonly choices: readonly {
    readonly key: QuizChoiceKey;
    readonly answer: unknown;
  }[];
  readonly answerKey: QuizChoiceKey;
  readonly answer: unknown;
}

export interface AiQuizNormalizationContext {
  readonly poolItemsBySourceId: ReadonlyMap<string, QuizPoolItem>;
  readonly poolItemsByCompoundPrompt: ReadonlyMap<string, QuizPoolItem>;
  readonly meaningPoolItems: readonly QuizPoolItem[];
  readonly compoundPoolItems: readonly QuizPoolItem[];
  readonly contextReadings: readonly string[];
}

const localizedAnswerSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    en: { type: "string" },
    id: { type: "string" },
  },
  required: ["en", "id"],
} as const;

const localizedChoiceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    key: { type: "string", enum: ["A", "B", "C", "D"] },
    answer: localizedAnswerSchema,
  },
  required: ["key", "answer"],
} as const;

const readingChoiceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    key: { type: "string", enum: ["A", "B", "C", "D"] },
    answer: { type: "string" },
  },
  required: ["key", "answer"],
} as const;

const questionBaseProperties = {
  sourceItemId: { type: "string" },
  prompt: { type: "string" },
  answerKey: { type: "string", enum: ["A", "B", "C", "D"] },
} as const;

const questionBaseRequired = [
  "sourceItemId",
  "prompt",
  "quizType",
  "choices",
  "answerKey",
  "answer",
] as const;

const localizedQuestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ...questionBaseProperties,
    quizType: { type: "string", enum: ["meaning", "compound"] },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: localizedChoiceSchema,
    },
    answer: localizedAnswerSchema,
  },
  required: questionBaseRequired,
} as const;

const readingQuestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ...questionBaseProperties,
    quizType: { type: "string", enum: ["reading"] },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: readingChoiceSchema,
    },
    answer: { type: "string" },
  },
  required: questionBaseRequired,
} as const;

export function buildAiQuizOutputSchema(quizTypes: readonly QuizType[]) {
  const includesReading = quizTypes.includes("reading");
  const includesLocalized = quizTypes.some(
    (quizType) => quizType === "meaning" || quizType === "compound",
  );

  let questionSchema: Record<string, unknown>;

  if (includesReading && includesLocalized) {
    questionSchema = {
      oneOf: [localizedQuestionSchema, readingQuestionSchema],
    };
  } else if (includesReading) {
    questionSchema = readingQuestionSchema;
  } else {
    questionSchema = localizedQuestionSchema;
  }

  return {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        minItems: 1,
        items: questionSchema,
      },
    },
    required: ["questions"],
  } as const;
}

export interface AiQuizQuestionsPayload {
  readonly questions: readonly AiRawQuizQuestion[];
}

export function parseAiQuizQuestionsPayload(text: string): AiQuizQuestionsPayload {
  let parsed: unknown;

  try {
    parsed = parseAiQuizJsonContent(text);
  } catch {
    throw new BadRequestError("AI quiz response was not valid JSON.");
  }

  if (!isAiQuizQuestionsPayload(parsed)) {
    throw new BadRequestError(
      "AI quiz response did not match the expected shape.",
    );
  }

  return parsed;
}

function parseAiQuizJsonContent(text: string): unknown {
  const candidates = collectJsonParseCandidates(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      continue;
    }
  }

  throw new SyntaxError("AI quiz response was not valid JSON.");
}

function collectJsonParseCandidates(text: string): string[] {
  const trimmed = text.trim();
  const candidates = new Set<string>([trimmed]);

  const fencedBody = extractMarkdownFenceBody(trimmed);

  if (fencedBody) {
    candidates.add(fencedBody);
  }

  const objectSlice = extractFirstJsonObject(trimmed);

  if (objectSlice) {
    candidates.add(objectSlice);
  }

  return [...candidates];
}

function extractMarkdownFenceBody(text: string): string | undefined {
  const closedFence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i.exec(text);

  if (closedFence?.[1]) {
    return closedFence[1].trim();
  }

  const openFence = /^```(?:json)?\s*\r?\n?([\s\S]+)$/i.exec(text);

  if (openFence?.[1]) {
    return openFence[1].replace(/```\s*$/m, "").trim();
  }

  return undefined;
}

function extractFirstJsonObject(text: string): string | undefined {
  const start = text.indexOf("{");

  if (start < 0) {
    return undefined;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return undefined;
}

function isAiQuizQuestionsPayload(
  value: unknown,
): value is AiQuizQuestionsPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { readonly questions?: unknown };

  return (
    Array.isArray(candidate.questions) &&
    candidate.questions.every(isAiRawQuizQuestion)
  );
}

export function buildAiQuizNormalizationContext(
  context: readonly QuizPoolItem[],
): AiQuizNormalizationContext {
  const poolItemsBySourceId = new Map<string, QuizPoolItem>();
  const poolItemsByCompoundPrompt = new Map<string, QuizPoolItem>();
  const readingSet = new Set<string>();

  for (const item of context) {
    if (!poolItemsBySourceId.has(item.sourceItemId)) {
      poolItemsBySourceId.set(item.sourceItemId, item);
    }

    if (item.metadata.quizType === "compound") {
      poolItemsByCompoundPrompt.set(item.prompt, item);
      poolItemsByCompoundPrompt.set(extractPromptText(item.prompt), item);
    }

    for (const reading of extractPoolReadings(item)) {
      readingSet.add(reading);
    }
  }

  return {
    poolItemsBySourceId,
    poolItemsByCompoundPrompt,
    meaningPoolItems: context.filter((item) => item.metadata.quizType === "meaning"),
    compoundPoolItems: context.filter((item) => item.metadata.quizType === "compound"),
    contextReadings: [...readingSet],
  };
}

export function mapAiQuizQuestionToGenerated(
  question: AiRawQuizQuestion,
  input: GenerateQuizInput,
  index: number,
  options: {
    readonly idPrefix: string;
    readonly normalizationContext: AiQuizNormalizationContext;
  },
): GeneratedQuizQuestion {
  if (!input.quizTypes.includes(question.quizType)) {
    throw new BadRequestError("AI quiz response used an unrequested quiz type.");
  }

  const poolItem = options.normalizationContext.poolItemsBySourceId.get(
    question.sourceItemId,
  );

  const base = {
    id: `${options.idPrefix}-${randomUUID()}-${index + 1}`,
    sourceItemId: question.sourceItemId,
    section: input.section,
    prompt: formatQuizPrompt(question.quizType, poolItem, question.prompt),
    answerKey: question.answerKey,
    generationMode: "ai_generated" as const,
    isAiGenerated: true,
    isVerified: false,
  };

  if (question.quizType === "reading") {
    const normalized = normalizeReadingQuestion(
      question,
      options.normalizationContext,
    );

    return {
      ...base,
      quizType: "reading",
      prompt: normalized.prompt,
      choices: normalized.choices,
      answerKey: normalized.answerKey,
      answer: normalized.answer,
    };
  }

  const localized = normalizeLocalizedQuestion(
    question,
    question.quizType,
    options.normalizationContext,
  );

  if (question.quizType === "meaning") {
    return {
      ...base,
      quizType: "meaning",
      prompt: localized.prompt,
      choices: localized.choices,
      answerKey: localized.answerKey,
      answer: localized.answer,
    };
  }

  return {
    ...base,
    quizType: "compound",
    prompt: localized.prompt,
    choices: localized.choices,
    answerKey: localized.answerKey,
    answer: localized.answer,
  };
}

export function isAiRawQuizQuestion(value: unknown): value is AiRawQuizQuestion {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<AiRawQuizQuestion>;

  return (
    typeof candidate.sourceItemId === "string" &&
    typeof candidate.prompt === "string" &&
    isQuizType(candidate.quizType) &&
    Array.isArray(candidate.choices) &&
    candidate.choices.length === 4 &&
    candidate.choices.every(isAiRawChoice) &&
    isQuizChoiceKey(candidate.answerKey) &&
    candidate.answer !== undefined
  );
}

export function formatReadingPrompt(compound: string): string {
  return `${extractPromptText(compound)}（　　）`;
}

export function formatQuizPrompt(
  quizType: QuizType,
  poolItem: QuizPoolItem | undefined,
  rawPrompt: string,
): string {
  if (quizType === "reading") {
    const compound = poolItem?.prompt ?? rawPrompt;
    return formatReadingPrompt(compound);
  }

  if (poolItem?.prompt) {
    return formatLocalizedPrompt(quizType, poolItem.prompt);
  }

  return formatLocalizedPrompt(quizType, rawPrompt);
}

export function formatLocalizedPrompt(
  _quizType: "meaning" | "compound",
  prompt: string,
): string {
  return extractPromptText(prompt.trim());
}

interface NormalizedLocalizedQuestion {
  readonly prompt: string;
  readonly choices: readonly { readonly key: QuizChoiceKey; readonly answer: LocalizedText }[];
  readonly answerKey: QuizChoiceKey;
  readonly answer: LocalizedText;
}

function normalizeLocalizedQuestion(
  question: AiRawQuizQuestion,
  quizType: "meaning" | "compound",
  normalizationContext: AiQuizNormalizationContext,
): NormalizedLocalizedQuestion {
  const poolItem = findPoolItemForLocalizedQuestion(
    question,
    quizType,
    normalizationContext,
  );

  if (!poolItem) {
    throw new BadRequestError(
      `No dataset pool item found for ${quizType} question ${question.sourceItemId}.`,
    );
  }

  const siblingPool =
    quizType === "meaning"
      ? normalizationContext.meaningPoolItems
      : normalizationContext.compoundPoolItems;
  const distractors = shuffleItems(
    siblingPool
      .filter((item) => item.id !== poolItem.id)
      .map((item) => item.answer),
  ).slice(0, 3);
  const choices = buildLocalizedChoices(poolItem.answer, distractors);
  const correctChoice = choices.find((choice) =>
    isSameLocalizedAnswer(choice.answer, poolItem.answer),
  );

  if (!correctChoice) {
    throw new BadRequestError(
      `Failed to build ${quizType} choices for ${question.sourceItemId}.`,
    );
  }

  return {
    prompt: formatLocalizedPrompt(quizType, poolItem.prompt),
    choices,
    answerKey: correctChoice.key,
    answer: poolItem.answer,
  };
}

function findPoolItemForLocalizedQuestion(
  question: AiRawQuizQuestion,
  quizType: "meaning" | "compound",
  normalizationContext: AiQuizNormalizationContext,
): QuizPoolItem | undefined {
  const promptText = extractPromptText(question.prompt);
  const siblings =
    quizType === "meaning"
      ? normalizationContext.meaningPoolItems
      : normalizationContext.compoundPoolItems;

  const promptMatch = siblings.find(
    (item) =>
      item.sourceItemId === question.sourceItemId &&
      (item.prompt === promptText || extractPromptText(item.prompt) === promptText),
  );

  if (promptMatch) {
    return promptMatch;
  }

  if (quizType === "compound") {
    const byPrompt = normalizationContext.poolItemsByCompoundPrompt.get(promptText);
    if (byPrompt) {
      return byPrompt;
    }
  }

  return siblings.find((item) => item.sourceItemId === question.sourceItemId);
}

function buildLocalizedChoices(
  answer: LocalizedText,
  distractors: readonly LocalizedText[],
): NormalizedLocalizedQuestion["choices"] {
  const keys: QuizChoiceKey[] = ["A", "B", "C", "D"];
  const uniqueDistractors = [
    ...new Map(
      distractors
        .filter((distractor) => !isSameLocalizedAnswer(distractor, answer))
        .map((distractor) => [`${distractor.en}\0${distractor.id}`, distractor]),
    ).values(),
  ];

  if (uniqueDistractors.length < 3) {
    throw new BadRequestError(
      "Quiz generation failed: not enough dataset distractors were available.",
    );
  }

  const selectedDistractors = shuffleItems(uniqueDistractors).slice(0, 3);
  const answers = shuffleItems([answer, ...selectedDistractors]);

  return answers.map((choice, index) => ({
    key: keys[index] ?? "D",
    answer: choice,
  }));
}

function isSameLocalizedAnswer(first: LocalizedText, second: LocalizedText): boolean {
  return first.en === second.en && first.id === second.id;
}

interface NormalizedReadingQuestion {
  readonly sourceItemId: string;
  readonly prompt: string;
  readonly choices: readonly ReadingQuizChoice[];
  readonly answerKey: QuizChoiceKey;
  readonly answer: string;
}

function normalizeReadingQuestion(
  question: AiRawQuizQuestion,
  normalizationContext: AiQuizNormalizationContext,
): NormalizedReadingQuestion {
  const coerced: NormalizedReadingQuestion = {
    sourceItemId: question.sourceItemId,
    prompt: question.prompt,
    choices: question.choices.map((choice) => ({
      key: choice.key,
      answer: coerceReadingAnswer(choice.answer),
    })),
    answerKey: question.answerKey,
    answer: coerceReadingAnswer(question.answer),
  };

  const synced = syncReadingAnswerFromChoices(coerced);

  if (!needsReadingRepair(synced)) {
    return finalizeReadingQuestion(synced);
  }

  return repairReadingQuestion(synced, normalizationContext);
}

function finalizeReadingQuestion(
  question: NormalizedReadingQuestion,
): NormalizedReadingQuestion {
  const choices = question.choices.map((choice) => ({
    key: choice.key,
    answer: choice.answer.trim(),
  }));
  const correctChoice = choices.find((choice) => choice.key === question.answerKey);

  return {
    sourceItemId: question.sourceItemId,
    prompt: formatReadingPrompt(extractPromptText(question.prompt)),
    choices,
    answerKey: question.answerKey,
    answer: correctChoice?.answer ?? question.answer.trim(),
  };
}

function syncReadingAnswerFromChoices(
  question: NormalizedReadingQuestion,
): NormalizedReadingQuestion {
  const correctChoice = question.choices.find(
    (choice) => choice.key === question.answerKey,
  );

  if (correctChoice && isValidKanaReading(correctChoice.answer)) {
    return {
      ...question,
      answer: correctChoice.answer.trim(),
    };
  }

  const salvagedChoice = findFirstValidReadingChoice(question.choices);

  if (salvagedChoice) {
    return {
      ...question,
      answerKey: salvagedChoice.key,
      answer: salvagedChoice.answer.trim(),
    };
  }

  return question;
}

function needsReadingRepair(question: NormalizedReadingQuestion): boolean {
  const values = [
    ...question.choices.map((choice) => choice.answer),
    question.answer,
  ];

  return (
    values.some((value) => !isValidKanaReading(value) || isRomajiOnly(value)) ||
    hasDuplicateReadingChoices(question.choices)
  );
}

function repairReadingQuestion(
  question: NormalizedReadingQuestion,
  normalizationContext: AiQuizNormalizationContext,
): NormalizedReadingQuestion {
  const primaryReading = resolveCorrectReading(question, normalizationContext);

  if (!primaryReading) {
    throw new BadRequestError(
      "Reading quiz generation failed: the model must return kana string answers for every choice.",
    );
  }

  const salvagedDistractors = [
    ...new Set(
      question.choices
        .map((choice) => choice.answer.trim())
        .filter(
          (answer) =>
            isValidKanaReading(answer) && answer !== primaryReading,
        ),
    ),
  ];

  const distractors = [
    ...salvagedDistractors,
    ...pickReadingDistractors(primaryReading, normalizationContext.contextReadings),
  ]
    .filter((answer, index, answers) => answers.indexOf(answer) === index)
    .filter((answer) => answer !== primaryReading)
    .slice(0, 3);

  const choices = buildReadingChoices(primaryReading, distractors);
  const correctChoice = choices.find((choice) => choice.answer === primaryReading);

  if (!correctChoice) {
    throw new BadRequestError(
      `Failed to rebuild reading choices for ${question.sourceItemId}.`,
    );
  }

  return {
    sourceItemId: question.sourceItemId,
    prompt: formatReadingPrompt(extractPromptText(question.prompt)),
    choices,
    answerKey: correctChoice.key,
    answer: primaryReading,
  };
}

function resolveCorrectReading(
  question: NormalizedReadingQuestion,
  normalizationContext: AiQuizNormalizationContext,
): string | undefined {
  const fromMetadata = pickReadingFromPoolMetadata(
    question,
    normalizationContext,
  );

  if (fromMetadata) {
    return fromMetadata;
  }

  if (hasDuplicateReadingChoices(question.choices)) {
    return undefined;
  }

  const keyedChoice = question.choices.find(
    (choice) => choice.key === question.answerKey,
  );

  if (keyedChoice && isValidKanaReading(keyedChoice.answer)) {
    return keyedChoice.answer.trim();
  }

  const salvagedChoice = findFirstValidReadingChoice(question.choices);

  if (salvagedChoice) {
    return salvagedChoice.answer.trim();
  }

  if (isValidKanaReading(question.answer)) {
    return question.answer.trim();
  }

  return undefined;
}

function pickReadingFromPoolMetadata(
  question: NormalizedReadingQuestion,
  normalizationContext: AiQuizNormalizationContext,
): string | undefined {
  const compound = extractPromptText(question.prompt);
  const compoundItem = normalizationContext.poolItemsByCompoundPrompt.get(compound);
  const compoundReading = asOptionalString(compoundItem?.metadata.reading);

  if (compoundReading && isValidKanaReading(compoundReading)) {
    return compoundReading;
  }

  if (isCompoundPrompt(compound)) {
    return undefined;
  }

  if (!isSingleKanjiPrompt(compound)) {
    return undefined;
  }

  const poolItem = normalizationContext.poolItemsBySourceId.get(
    question.sourceItemId,
  );

  if (!poolItem) {
    return undefined;
  }

  const kunyomi = asStringArray(poolItem.metadata.kunyomi);
  const onyomi = asStringArray(poolItem.metadata.onyomi);
  return kunyomi[0] ?? onyomi[0];
}

function findFirstValidReadingChoice(
  choices: readonly ReadingQuizChoice[],
): ReadingQuizChoice | undefined {
  return choices.find((choice) => isValidKanaReading(choice.answer));
}

function hasDuplicateReadingChoices(choices: readonly ReadingQuizChoice[]): boolean {
  const normalizedChoices = choices.map((choice) => choice.answer.trim());
  return new Set(normalizedChoices).size !== normalizedChoices.length;
}

function isValidKanaReading(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || isRomajiOnly(trimmed)) {
    return false;
  }

  return /[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed);
}

function isRomajiOnly(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || containsJapaneseScript(trimmed)) {
    return false;
  }

  return /^[A-Za-z\u0100-\u024F\u0300-\u036F]+$/.test(trimmed);
}

function containsJapaneseScript(value: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(value);
}

function coerceReadingAnswer(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object" && value !== null) {
    const candidate = value as Partial<LocalizedText>;
    const en = typeof candidate.en === "string" ? candidate.en.trim() : "";
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";

    if (en && isValidKanaReading(en)) {
      return en;
    }

    if (id && isValidKanaReading(id)) {
      return id;
    }

    return en || id;
  }

  return "";
}

function extractPromptText(prompt: string): string {
  let text = prompt.trim();

  while (true) {
    const stripped = text.replace(/\s*[（(][^（）()]*[）)]\s*$/u, "").trim();

    if (stripped === text) {
      return text;
    }

    text = stripped;
  }
}

function isSingleKanjiPrompt(prompt: string): boolean {
  return Array.from(extractPromptText(prompt)).length === 1;
}

function isCompoundPrompt(prompt: string): boolean {
  return Array.from(extractPromptText(prompt)).length >= 2;
}

function extractPoolReadings(item: QuizPoolItem): string[] {
  const compoundReading = asOptionalString(item.metadata.reading);

  return [
    ...(compoundReading ? [compoundReading] : []),
    ...asStringArray(item.metadata.kunyomi),
    ...asStringArray(item.metadata.onyomi),
  ];
}

function pickReadingDistractors(
  correctReading: string,
  contextReadings: readonly string[],
): string[] {
  const unique = [
    ...new Set(contextReadings.filter((reading) => reading !== correctReading)),
  ];

  if (unique.length >= 3) {
    return shuffleItems(unique).slice(0, 3);
  }

  const fallbacks = ["あい", "うえ", "かき", "くけ", "さし", "たて"];
  return [...unique, ...fallbacks.filter((reading) => reading !== correctReading)].slice(
    0,
    3,
  );
}

function buildReadingChoices(
  correctReading: string,
  distractors: readonly string[],
): ReadingQuizChoice[] {
  const keys: QuizChoiceKey[] = ["A", "B", "C", "D"];
  const readings = shuffleItems([correctReading, ...distractors.slice(0, 3)]);

  return readings.map((reading, index) => ({
    key: keys[index] ?? "D",
    answer: reading,
  }));
}

function isAiRawChoice(
  value: unknown,
): value is { readonly key: QuizChoiceKey; readonly answer: unknown } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<{
    readonly key: QuizChoiceKey;
    readonly answer: unknown;
  }>;

  return isQuizChoiceKey(candidate.key) && candidate.answer !== undefined;
}

function isQuizChoiceKey(value: unknown): value is QuizChoiceKey {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function isQuizType(value: unknown): value is QuizType {
  return value === "meaning" || value === "reading" || value === "compound";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function shuffleItems<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
