# API Contract

The current API is a Fastify layer over normalized JSON files. Database-backed writes, authentication, progress persistence, and AI endpoints are deferred.

## Future Stack

- Runtime: Node.js with TypeScript.
- Web framework: Fastify.
- Validation: Zod or JSON Schema.
- Database: PostgreSQL.
- ORM/query layer: Drizzle.

## API Principles

- Route handlers should stay thin.
- Business logic belongs in service modules, shared common modules, or dedicated domain modules.
- Dataset schemas should be shared between parsing, validation, seeding, and API responses.
- API responses should be stable for web and mobile clients.
- Pagination and filtering should be designed before large datasets are exposed.
- Reference artifacts should be parsed into normalized data before being served by API endpoints.
- OpenAPI documentation should be generated from Fastify route schemas with `@fastify/swagger`.

## Current API

```txt
GET /health
GET /api/v1/levels
GET /api/v1/kanji?level=n5&page=1&size=10
GET /api/v1/kanji?level=n5&week=1&day=1&page=1&size=10
GET /api/v1/kanji/:id
GET /api/v1/quizzes/pool?level=n5&section=kanji&page=1&size=10
POST /api/v1/quizzes/generate
```

Swagger/OpenAPI documentation:

```txt
GET /api-docs
GET /api-docs/json
```

Current endpoint behavior:

- Read from `data/normalized/<level>/`.
- Support N5, N4, and N3.
- Keep route handlers thin and delegate parsing/business rules to services.
- Keep 2xx responses wrapped in `{ status, message, data }`.
- Keep paginated list responses wrapped in `{ status, message, data, paginate }`.
- Keep handled 4xx responses wrapped in `{ status, message }`.
- Keep 5xx responses wrapped in `{ status, error }`.
- Do not add PostgreSQL, Drizzle, or auth to the JSON-backed foundation yet.
- Dataset quiz generation should be non-streaming. Reserve SSE for future AI-assisted generation.
- Dataset-only quiz generation should use safe meaning questions only. For kanji, this means single-kanji prompts only.
- Allow `AI_PROVIDER=mock` for local AI-flow testing without external quota.
- Use the OpenAI SDK for `generationMode: "ai_generated"` when `AI_PROVIDER=openai`.
- Use OpenRouter through the OpenAI-compatible chat completion API when `AI_PROVIDER=openrouter`.
- Return `501` when AI generation is requested but no AI provider is configured.
- Reading and compound-style quiz generation should use the explicit AI-assisted mode.

## Future Resource Shape

Future learning item responses should include:

```json
{
  "id": "n5-vocab-mizu",
  "level": "n5",
  "type": "vocab",
  "content": {},
  "meaning": {
    "en": "water",
    "id": "air"
  },
  "status": "verified"
}
```

## Streaming

Future AI explanation endpoints may use Server-Sent Events. Streaming endpoints should be isolated from standard CRUD/listing endpoints and should include clear cancellation and timeout behavior.

## Future Quiz API

Quiz generation should fetch from the normalized dataset first.

Recommended future endpoints:

```txt
POST /api/v1/quizzes/generate/stream
POST /api/v1/quizzes/:quizId/answers
GET /api/v1/quizzes/:quizId/summary
```

Quiz generation rules:

- Support N5, N4, and N3.
- Support vocab, kanji, and grammar quiz modes.
- Support filters for `level`, `section`, `week`, `day`, `source`, and `difficulty` when available.
- Randomize item order at request time.
- Randomize answer order at request time.
- Do not persist random ordering into the source dataset.
- Allow dataset-only generation by default.
- Limit dataset-only generation to safe meaning questions.
- Allow AI-assisted generation only when explicitly requested with `generationMode: "ai_generated"`.
- Accept `quizType` as an array of requested quiz types.
- For dataset generation, always narrow requested quiz types to `["meaning"]`.
- For AI generation, use the requested quiz types and reject AI output that returns an unrequested type.
- Return `501` when AI generation is requested before an AI provider is configured.
- Mark AI-generated quiz content with `is_ai_generated = true` and `is_verified = false`.
- Keep generated quiz output compatible with web and mobile clients.

Streaming quiz generation may use SSE for long-running AI-assisted generation. Dataset-only quiz generation should usually be non-streaming unless the client specifically needs progressive delivery.

Suggested SSE events:

```txt
metadata
question
warning
done
```

## Future Progress API

Progress logs should be generated from structured review/session events, not manually maintained as source files.

Recommended future endpoints:

```txt
POST /api/v1/progress/events
GET /api/v1/progress/summary
GET /api/v1/progress/sessions
GET /api/v1/progress/next-session
```

Session summaries should support:

- score
- status
- reviewed items
- mastered items
- quiz type breakdown
- retry count or focused-review notes
- next session suggestion
