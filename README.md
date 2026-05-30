# JLPT Foundation

Dataset-first backend foundation for a JLPT N5/N4/N3 learning platform.

This repository starts with project structure, documentation, N5/N4/N3 reference parsing, kanji-first raw dataset tooling, and a JSON-backed Fastify API. The database, ORM, authentication, and production app features are intentionally deferred.

## Goals

- Support JLPT N5, N4, and N3 first.
- Keep N2 and N1 possible later without redesigning the dataset model.
- Store learning content in a human-reviewable markdown format before normalizing it into application data.
- Support English and Indonesian meanings or explanations for every learning item.
- Keep future API logic usable by both web and mobile clients.
- Keep business logic outside Fastify route handlers when the API is added.
- Prepare for future AI explanation endpoints, including streaming or SSE, without treating generated content as verified by default.

## Structure

```text
docs/                 Project rules and contracts
data/reference/       Level-specific curriculum/list reference artifacts
data/raw/             Human-authored source markdown by JLPT level and item type
src/                  Fastify API with module-based hexagonal structure
scripts/              Future dataset parsing, validation, and seeding scripts
```

Feature modules under `src/modules` use a small hexagonal layout:

```text
src/modules/<module>/
├── <module>.controller.ts
├── <module>.module.ts
├── <module>.routes.ts
├── <module>.service.ts
├── application/       Ports/interfaces and application-owned types
└── infrastructure/    JSON/database/provider adapters and HTTP schemas
```

`src/routes.ts` registers module routes under the API version prefix.

Future folders may include `data/seeds` when database seeding is implemented.

## Current Scope

Implemented now:

- Initial folder structure.
- Practical starter documentation.
- N5, N4, and N3 reference artifacts for curriculum and kanji lists.
- Generated N5, N4, and N3 kanji raw markdown mirrored from reference kanji lists.
- TypeScript parser, validator, generator, and tests for reference and raw kanji data.
- Read-only Fastify API backed by normalized JSON.
- OpenAPI/Swagger documentation via `@fastify/swagger` and `@fastify/swagger-ui`.

Not implemented yet:

- PostgreSQL schema.
- Drizzle setup.
- Large JLPT dataset.
- AI endpoints.
- Authentication or user progress storage.

## Shared Code Direction

Start simple with one backend app. Shared schemas, progress logic, and prompt templates should live inside the app structure first, such as `src/common/schemas`, `src/modules/progress`, and `src/modules/ai/prompts`.

Add a `packages/` folder later only if multiple apps need to reuse the same code directly.

## Data Workflow

1. Level reference files live in `data/reference/<level>/`, such as curriculum TOC files and kanji lists.
2. Authors add or edit item markdown files in `data/raw/<level>/<type>/`.
3. `scripts/validate-dataset.ts` will later validate required fields, language coverage, IDs, tags, and source metadata.
4. `scripts/parse-md.ts` converts current raw markdown into normalized JSON.
5. `scripts/seed-db.ts` will later seed PostgreSQL after the database layer exists.

Progress logs are not source references. They are future generated user/session artifacts based on quiz and review activity.

## Dataset Tooling

Current reference and raw kanji tooling:

```bash
pnpm parse:reference
pnpm validate:reference
pnpm generate:raw-kanji
pnpm parse:raw
pnpm validate:raw
pnpm generate:normalized
pnpm test
pnpm typecheck
```

Generated output:

```text
data/normalized/n3/curriculum.json
data/normalized/n3/kanji.json
data/normalized/n3/quiz-pool.json
data/normalized/n3/raw-items.json
data/normalized/n4/curriculum.json
data/normalized/n4/kanji.json
data/normalized/n4/quiz-pool.json
data/normalized/n4/raw-items.json
data/normalized/n5/curriculum.json
data/normalized/n5/kanji.json
data/normalized/n5/quiz-pool.json
data/normalized/n5/raw-items.json
```

## API

Run the local API:

```bash
pnpm dev
```

Initial endpoints:

```text
GET /health
GET /api/v1/levels
GET /api/v1/kanji?level=n5&page=1&size=10
GET /api/v1/kanji?level=n5&week=1&day=1&page=1&size=10
GET /api/v1/kanji/:id
GET /api/v1/quizzes/pool?level=n5&section=kanji&page=1&size=10
POST /api/v1/quizzes/generate
```

API documentation:

```text
GET /api-docs
GET /api-docs/json
```

AI quiz generation can run in mock mode without external API quota:

```env
AI_PROVIDER=mock
```

Use the OpenAI SDK later when API billing/quota is available:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

OpenRouter is also supported through its OpenAI-compatible API:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openrouter/free
OPENROUTER_SERVER_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_TITLE=JLPT Foundation
OPENROUTER_HTTP_REFERER=http://127.0.0.1:3000
```

The API is JSON-backed. It does not use PostgreSQL, Drizzle, or auth yet. Dataset quiz generation is non-streaming and limited to safe meaning questions. AI generation supports the `generationMode: "ai_generated"` contract for meaning, reading, and compound quiz types.

Quiz generation accepts `quizType` as an array:

```json
{
  "level": "n5",
  "section": "kanji",
  "count": 10,
  "generationMode": "ai_generated",
  "quizType": ["meaning", "reading", "compound"]
}
```

For `generationMode: "dataset"`, the API always narrows `quizType` to `["meaning"]`.

See `docs/01-dataset-rules.md` and `docs/02-markdown-format.md` for the intended dataset rules.
