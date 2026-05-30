# Development Rules — Fastify Backend

> Project: JLPT Learning Data Foundation  
> Stack: TypeScript + Fastify + PostgreSQL + Zod + Drizzle  
> Purpose: Keep backend development simple, consistent, secure, and dataset-first.

---

## 1. Engineering Approach

Act like a senior backend engineer building a small, durable foundation.

Rules:

- Prefer simple, direct solutions over complex abstractions.
- Briefly explain architectural decisions before major code changes.
- Prioritize security, readability, maintainability, and dataset correctness.
- Ask when product behavior is ambiguous.
- Do not add infrastructure before the project needs it.
- Keep implementation choices aligned with the current stack, not generic backend templates.

---

## 2. Project Direction

This project is a **dataset-first backend foundation** for JLPT learning content.

The backend should support:

- JLPT N5, N4, and N3 content first.
- Future N2 and N1 content without redesigning the data model.
- Vocabulary, kanji, grammar, examples, and quizzes.
- English and Indonesian meaning/explanation for every learning item.
- Markdown dataset conversion and validation.
- Progress tracking and mastery calculation.
- REST API for future web and mobile apps.
- Future AI explanation and streaming endpoints.

Keep the project simple. Do not build UI/mobile concerns inside the backend.

---

## 3. Architecture Rule

Use a small hexagonal architecture inside each feature module:

```txt
Routes → Controller → Service → Application Port → Infrastructure Repository Adapter
```

Responsibilities:

- **Routes**: register Fastify routes, schemas, hooks, and prefixes only.
- **Controllers**: handle request/reply only.
- **Services**: contain use cases, business rules, and orchestration. Keep them beside the controller/module/route files.
- **Application**: contains ports/interfaces and application-owned types.
- **Infrastructure adapters**: contain JSON file access, database queries, external API clients, cache/provider implementations, and HTTP schema files.

Never put business logic in route files or controllers.

Dependency direction:

```txt
infrastructure → application ports/types
service → application ports/types
controller/routes → service
module composition → service + infrastructure
```

Service and application code must not import infrastructure code.

---

## 4. Recommended Structure

Start with a single backend app structure. Do not use a `packages/` folder until there is a real need to share code across multiple apps or publish reusable modules.

```txt
src/
├── modules/
│   └── dataset/
│       ├── dataset.controller.ts
│       ├── dataset.module.ts
│       ├── dataset.routes.ts
│       ├── dataset.service.ts
│       ├── application/
│       │   ├── ports/
│       │   │   └── dataset-repository.port.ts
│       │   └── types/
│       │       └── dataset.type.ts
│       └── infrastructure/
│           ├── http/
│           └── repository/
│
├── common/
│   ├── errors/
│   ├── plugins/
│   ├── responses/
│   ├── schemas/
│   ├── types/
│   └── utils/
│
├── config/
├── database/
├── routes.ts
├── app.ts
└── main.ts

data/
├── reference/
├── raw/
├── normalized/     # future generated output
└── seeds/          # future database seed output

docs/
├── 00-project-context.md
├── 01-dataset-rules.md
├── 02-markdown-format.md
├── 03-api-contract.md
├── 04-progress-rules.md
├── 05-ai-prompt-rules.md
└── 06-development-rules.md

scripts/
├── parse-md.ts
├── validate-dataset.ts
└── seed-db.ts
```

Shared code rules:

- Put shared schemas in `src/common/schemas` first.
- Put progress logic in `src/modules/progress` first.
- Put AI prompt templates in `src/modules/ai/prompts` first.
- Extract to `packages/` later only if multiple apps need the same code.
- Add new feature modules with `application` and `infrastructure` folders when the module has business rules or persistence/provider boundaries.
- Keep repository implementations under `infrastructure/repository`; keep repository interfaces under `application/ports`.
- Keep module-owned types under `application/types`.
- Split repository operations into focused files when it improves maintainability.

---

## 5. TypeScript Rules

- Use TypeScript with `strict: true`.
- Avoid `any`; if unavoidable, add a short comment explaining why.
- Use `unknown` when the type is not known yet.
- Use explicit return types for exported functions.
- Use `interface` for object shapes.
- Use `type` for unions and inferred schema types.
- Infer DTO types from Zod schemas instead of duplicating definitions.
- Use `readonly` for properties that should not be mutated.
- Prefer named exports.
- Keep files small and focused.

---

## 6. Fastify Rules

- Use Fastify plugins and route registration by module.
- Use route schemas for validation and documentation.
- Use Fastify logger instead of `console.log`.
- Use `app.decorate` only for shared dependencies such as `db`, `redis`, or config.
- Avoid Express-style middleware patterns unless necessary.
- Keep route prefixes consistent and versioned.

Example:

```ts
app.register(itemsRoutes, { prefix: "/api/v1/items" })
```

---

## 7. Validation Rules

Use **Zod** as the main validation tool unless the project later standardizes on JSON Schema.

Rules:

- Every route that accepts input must have validation.
- Validate `body`, `params`, and `query`.
- Store module schemas in `*.schema.ts` files.
- Store shared schemas in `src/common/schemas`.
- Infer TypeScript types from Zod schemas.
- Do not duplicate DTO types manually.
- Do not validate manually inside controllers.
- Dataset validation must run before normalized output or seed data is produced.

---

## 8. Dataset Rules

Dataset flow:

```txt
Reference markdown + raw item markdown → normalized JSON → validation → database seed → API
```

Rules:

- Level reference artifacts live in `data/reference/<level>`.
- Raw content lives in `data/raw`.
- Generated JSON lives in `data/normalized`.
- Seed-ready data lives in `data/seeds`.
- Every dataset item must pass schema validation.
- Every item must support English and Indonesian meaning/explanation.
- AI-generated content must be marked as unverified.
- Do not create new dataset fields without updating docs and schemas.
- Progress logs are generated from user activity, not treated as source references.

Initial levels:

```txt
N5, N4, N3
```

Future levels:

```txt
N2, N1
```

Initial item types:

```txt
vocab, kanji, grammar
```

---

## 9. Database Rules

Use PostgreSQL when persistence is added.

ORM/query layer:

```txt
Drizzle
```

Rules:

- Use UUID primary keys for public entities.
- Use migrations only; do not rely on production schema auto-sync.
- Add `created_at` and `updated_at` to main tables.
- Put all database queries in repositories.
- Do not query the database from controllers.
- Use transactions for multi-write operations.
- Add indexes for frequently filtered fields such as `level`, `type`, `user_id`, and `item_id`.
- Never concatenate user input into SQL; use ORM/query-builder parameters.

---

## 10. API Rules

Use REST first.

Rules:

- Version routes with `/api/v1`.
- Use kebab-case route paths.
- Use UUIDs for public IDs.
- Use consistent response shapes.
- Use proper HTTP status codes.
- Keep responses friendly for web and mobile clients.
- Add pagination before exposing large list endpoints.
- Use stable sorting for paginated endpoints.

Recommended initial endpoints:

```txt
GET /api/v1/health
GET /api/v1/levels
GET /api/v1/items
GET /api/v1/items/:id
POST /api/v1/quizzes/generate
POST /api/v1/quizzes/generate/stream
GET /api/v1/practice/next
POST /api/v1/practice/answer
GET /api/v1/progress/summary
GET /api/v1/progress/weak-items
```

Response shape:

```ts
{
  status: "success",
  message: string,
  data: unknown
}
```

Handled 4xx error shape:

```ts
{
  status: "failed",
  message: string
}
```

Unhandled or internal 5xx error shape:

```ts
{
  status: "error",
  error: string
}
```

---

## 11. Error Handling Rules

- Use a global Fastify error handler.
- Create application error classes such as `NotFoundError`, `BadRequestError`, `UnauthorizedError`, and `ConflictError`.
- Never expose raw database errors, AI provider errors, or stack traces to clients.
- Log internal errors with the Fastify logger.
- Return consistent error responses.
- Keep user-facing error messages clear and non-sensitive.

---

## 12. Progress Rules

Progress logic must live in `src/modules/progress` first. Extract it later only if another app needs to reuse it directly.

Do not calculate mastery directly inside controllers.

Mastery levels:

```txt
0 = unseen
1 = seen
2 = learning
3 = familiar
4 = strong
5 = mastered
```

Rules:

- Correct answer increases mastery by 1.
- Wrong answer decreases mastery by 1.
- Minimum mastery is 0.
- Maximum mastery is 5.
- `wrong_count > correct_count` means weak item.
- `mastery >= 3` means completed.
- `mastery = 5` means mastered.
- Do not duplicate progress calculation logic.

---

## 13. AI Rules

AI features should be added after the dataset/API foundation is stable.

Rules:

- Do not call AI providers directly from controllers.
- Use an AI service/provider abstraction.
- Store prompt templates in `src/modules/ai/prompts` first.
- Do not hardcode long prompts inside controllers.
- Validate AI output before saving.
- AI-generated content must be marked:
  - `is_ai_generated = true`
  - `is_verified = false`
- Never let AI overwrite verified dataset content.
- Dataset-only quiz generation must not call AI.
- AI-assisted quiz generation must be explicitly requested.
- AI-generated quiz questions, distractors, explanations, and feedback must be marked unverified.

---

## 14. Quiz Generation Rules

Quiz generation should fetch from the normalized dataset first.

Rules:

- Support N5, N4, and N3.
- Support vocab, kanji, and grammar quiz modes.
- Randomize item order at request time.
- Randomize answer order and distractors at request time.
- Do not persist randomized order into source data.
- Keep quiz generation logic outside controllers.
- Keep generated quiz responses compatible with web and mobile clients.
- Allow AI-assisted generation only through an explicit option such as `generationMode: "ai-assisted"`.
- Mark AI-generated quiz content with `is_ai_generated = true` and `is_verified = false`.

---

## 15. Streaming Rules

Use **SSE** for AI-style streaming first.

Use streaming for:

- Kanji explanation.
- Grammar explanation.
- Wrong-answer explanation.
- AI-assisted quiz generation.

Rules:

- Keep normal non-streaming endpoints available.
- Validate input before streaming.
- Send structured events.
- Always send a final `done` event.
- Never stream secrets or raw provider errors.
- Define timeout and cancellation behavior before production use.

---

## 16. Security Rules

- Use environment variables for secrets.
- Do not commit `.env`.
- Use `@fastify/helmet`.
- Use `@fastify/cors`.
- Never use wildcard CORS in production.
- Validate all input.
- Use rate limiting for public endpoints.
- Do not expose raw database errors or stack traces.
- Do not log passwords, tokens, secrets, or raw authorization headers.
- Keep request body limits explicit.

---

## 17. Future Auth Rules

Authentication is deferred.

When authentication is added:

- Keep auth logic outside route handlers.
- Keep JWT payloads minimal.
- Never put sensitive data in JWT payloads.
- Use short-lived access tokens.
- Store refresh tokens securely.
- Hash passwords with bcrypt or argon2.
- Protect private routes with a Fastify hook or plugin.

---

## 18. Future Cache Rules

Redis is optional and deferred.

If Redis or another cache is added:

- Always set a TTL.
- Use namespaced keys such as `item:n5-vocab-mizu` or `user:uuid:progress`.
- Invalidate cache after mutations.
- Do not cache personalized data without considering authorization and privacy.

---

## 19. Naming Conventions

| Type | Convention | Example |
|---|---|---|
| File | kebab-case | `items.service.ts` |
| Class | PascalCase | `ItemsService` |
| Function / method | camelCase | `findById` |
| DTO / schema | PascalCase + suffix | `CreateItemDto`, `CreateItemSchema` |
| Interface | PascalCase | `LearningItem` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| API route | kebab-case | `/api/v1/weak-items` |
| Env variable | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 20. Testing Rules

Prioritize tests for:

- Curriculum TOC parser.
- Kanji list parser.
- Dataset schemas.
- Markdown parser.
- Progress rules.
- Quiz randomization and answer checking.
- Progress/session summary generation.
- Important API endpoints.
- Error handling for core flows.

Recommended tools:

```txt
Vitest
Fastify inject
```

Keep pure logic easy to test.

---

## 21. Documentation Rules

Update docs when changing:

- Dataset fields.
- Reference artifact format.
- Markdown format.
- API response shape.
- Progress formulas.
- Progress log output format.
- Database schema.
- AI prompt behavior.
- Quiz generation behavior.
- Security-sensitive behavior.

Important docs:

```txt
docs/00-project-context.md
docs/01-dataset-rules.md
docs/02-markdown-format.md
docs/03-api-contract.md
docs/04-progress-rules.md
docs/05-ai-prompt-rules.md
docs/06-development-rules.md
```

---

## 22. Never Do

- Never use `any` without explanation.
- Never put business logic in routes or controllers.
- Never query the database from controllers.
- Never skip validation on input routes.
- Never validate manually inside controllers.
- Never expose raw errors to clients.
- Never commit secrets.
- Never cache without TTL.
- Never hardcode long AI prompts inside controllers.
- Never let AI output bypass validation.
- Never overwrite verified dataset content with AI output.
- Never call AI for dataset-only quiz generation.
- Never store randomized quiz order as source dataset order.
- Never duplicate progress calculation logic.
- Never create new dataset fields without updating docs and schemas.
- Never generate a large dataset before the schema is stable.
- Never add `packages/` just for structure; extract only when reuse justifies it.
