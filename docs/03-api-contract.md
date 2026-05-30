# API Contract

The current API is a read-only Fastify layer over normalized JSON files. Database-backed write APIs, authentication, progress persistence, and AI endpoints are deferred.

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

## Current Read-Only API

```txt
GET /api/v1/health
GET /api/v1/levels
GET /api/v1/kanji?level=n5
GET /api/v1/kanji?level=n5&week=1&day=1
GET /api/v1/kanji/:id
GET /api/v1/quizzes/pool?level=n5&section=kanji
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
- Keep handled 4xx responses wrapped in `{ status, message }`.
- Keep 5xx responses wrapped in `{ status, error }`.
- Do not add PostgreSQL, Drizzle, auth, or AI generation to the read-only foundation yet.

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
POST /api/v1/quizzes/generate
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
- Allow AI-assisted generation only when explicitly requested.
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
