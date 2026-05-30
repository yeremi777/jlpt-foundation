# Project Context

JLPT Foundation is a backend/data foundation for a Japanese learning platform focused on JLPT N5, N4, and N3 learners.

The project is intentionally data-first. The first source of truth is a curated, reviewable dataset supported by level-specific reference artifacts. API routes, database tables, mobile features, web features, quizzes, progress logs, and AI explanations should all be built around this dataset contract instead of inventing separate formats per client.

## Initial Scope

- Levels: N5, N4, N3.
- Item types: vocabulary, kanji, grammar.
- Languages: English and Indonesian for meanings and explanations.
- Progress model: mastery level `0` through `5`.
- Backend stack later: TypeScript, Fastify, PostgreSQL, Drizzle, and Zod or JSON Schema.

## Source Artifacts

Reference artifacts live in `data/reference/<level>/`.

Current N3 examples:

- `data/reference/n3/n3_curriculum_toc.md`
- `data/reference/n3/n3_kanji_list.md`

N4 and N5 should use the same idea later with level-specific curriculum and kanji-list files.

Progress logs are different: they are generated from user learning sessions and should be modeled as output/session history, not as curriculum source references.

## Non-Goals For This Stage

- No production API implementation.
- No database schema or ORM setup.
- No generated large dataset.
- No AI generation pipeline.
- No authentication or user accounts.

## Design Principles

- Keep the dataset readable and easy to review.
- Keep business logic outside route handlers.
- Validate data before it reaches runtime features.
- Treat AI-generated content as unverified until a human review process marks it verified.
- Make future N2 and N1 support additive, not a redesign.
