# AI Prompt Rules

This document defines boundaries for AI-assisted endpoints and generated learning content.

Runtime prompts stay short in `src/modules/dataset/infrastructure/ai/ai-quiz-prompts.ts`. Meaning and compound answers are aligned to the dataset pool in `ai-quiz-response.ts`.

## Verification

AI-generated content must be marked `unverified` by default.

AI output must not silently overwrite verified dataset content. If AI suggests edits, those edits should be reviewed and merged through the dataset workflow.

## Language Support

AI explanations should support English and Indonesian. The requested language should be explicit in the API request and logged with the generated output metadata.

## Reference Context

AI prompts may use parsed reference artifacts from `data/reference/<level>/`, such as curriculum TOC files and kanji lists.

Rules:

- Provide only the relevant level, section, week, day, and item context.
- Separate verified dataset facts from generated AI wording.
- Do not ask the model to infer missing curriculum facts.
- Do not send entire large reference files when a small filtered subset is enough.
- Treat AI-generated quiz material as unverified until reviewed.

## Prompt Template Location

- Quiz prompts: `src/modules/dataset/infrastructure/ai/ai-quiz-prompts.ts`
- Quiz AI response handling: `src/modules/dataset/infrastructure/ai/ai-quiz-response.ts`
- Other AI prompt templates may live in `src/modules/ai/prompts` later.

Extract prompt templates to `packages/` later only if multiple apps need to reuse them directly.

## Streaming

Long explanations may use SSE later. Streaming responses should send structured events such as:

- `metadata`
- `chunk`
- `warning`
- `done`

Quiz generation may also use SSE when AI assistance is explicitly requested. Dataset-only quiz generation should not require AI.

AI quiz output may include generated distractors, explanations, or wrong-answer feedback. These outputs must be marked as AI-generated and unverified until reviewed.

## Safety And Quality

Prompts should ask the model to:

- avoid inventing JLPT status claims
- explain uncertainty when relevant
- keep examples level-appropriate
- separate verified dataset facts from generated explanation text
- prefer verified dataset facts when generating quizzes
- mark generated quiz material as unverified
