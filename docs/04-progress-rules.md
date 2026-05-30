# Progress Rules

Progress is not implemented yet. These rules define the future model.

## Mastery Levels

Each user-item pair should use mastery level `0` through `5`.

- `0`: unseen
- `1`: seen, not stable
- `2`: recognized with support
- `3`: remembered in normal review
- `4`: strong recall
- `5`: mastered

## Review Events

Future review events should record:

- user ID
- item ID
- answer result
- timestamp
- previous mastery level
- next mastery level
- review mode
- level
- section
- week and day when available
- quiz type when applicable
- whether the question was dataset-only or AI-assisted

## Session Summaries

Progress logs should be generated from structured review/session events.

A session summary should support:

- date
- level
- section
- week
- day
- session title
- score
- status
- reviewed items
- mastered items
- quiz type breakdown
- retry or focused-review notes
- next session suggestion

Example statuses:

- `Learning`
- `Review`
- `Mastered`
- `Week Complete`

Quiz type breakdowns should support kanji modes such as:

- meaning
- reading
- compound meaning

## Business Logic Boundary

Mastery transitions should live in `src/modules/progress`, not inside API route handlers. Route handlers should parse input, call the progress logic, and return the result.

Extract progress logic to `packages/` later only if multiple apps need to reuse it directly.

## Initial Assumption

The first implementation can use simple deterministic rules. Spaced repetition details can be added later after the data model and review UX are clearer.
