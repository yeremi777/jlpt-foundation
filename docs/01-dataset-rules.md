# Dataset Rules

The dataset must support N5, N4, and N3 first. N2 and N1 should be possible later by adding new level folders and schema enum values.

The dataset is the project source of truth. Claude/project-instruction behavior, API responses, quizzes, and future mobile/web views should be generated from this data instead of maintaining separate content formats.

## Learning Scope

Initial levels:

- `n5`
- `n4`
- `n3`

Future levels:

- `n2`
- `n1`

Initial item types:

- `vocab`
- `kanji`
- `grammar`

Expected study order inside each level:

1. Kanji
2. Vocabulary
3. Grammar
4. Reading and listening after the foundations

The N3 source order is based on Soumatome N3 as the primary path and Shinkanzen Master N3 as a depth reference. N4 and N5 should follow the same metadata model even if their exact book/week/day coverage is added later.

## Reference Artifacts

Level-specific reference artifacts live in:

```text
data/reference/<level>/
```

Current reference artifacts:

- `data/reference/n3/n3_curriculum_toc.md`
- `data/reference/n3/n3_kanji_list.md`
- `data/reference/n4/n4_curriculum_toc.md`
- `data/reference/n4/n4_kanji_list.md`
- `data/reference/n5/n5_curriculum_toc.md`
- `data/reference/n5/n5_kanji_list.md`

Expected future equivalents:

- `data/reference/n5/...`

Reference artifacts are used to organize curriculum order, source mapping, week/day grouping, kanji lists, and quiz generation context.

Progress logs are not reference artifacts. They are generated from user quiz/review activity and belong to future progress/session history.

## Curriculum TOC Rules

Curriculum TOC files should model:

- level
- section: `grammar`, `vocab`, or `kanji`
- primary source
- secondary/depth source
- week
- day
- sequence
- item ID
- title/topic/pattern
- English meaning or topic
- Indonesian meaning or topic
- difficulty when available
- source tag when available

Allowed source tags:

- `S`: Soumatome
- `K`: Shinkanzen
- `B`: both

Allowed difficulty values:

- `easy`
- `medium`
- `hard`

The N3 curriculum uses IDs like `g101`, `v101`, and week/day kanji groups. These are curriculum IDs, not necessarily final public item IDs. Normalized data should preserve both when useful:

- `id`: stable project item ID, such as `n3-grammar-te-shimau`
- `curriculum_id`: source curriculum ID, such as `g104`

## Item Identity

Each item needs a stable ID:

```text
<level>-<type>-<slug>
```

Examples:

- `n5-vocab-mizu`
- `n4-kanji-eki`
- `n3-grammar-bekida`

IDs must not change after publication. If content changes, update metadata rather than renaming the ID.

## Required Fields

Every item should include:

- `id`
- `level`
- `type`
- Japanese headword, kanji, or grammar pattern
- reading when applicable
- English meaning or explanation
- Indonesian meaning or explanation
- source/review status metadata
- examples where useful

## Language Requirements

Every learning item must support:

- English: `en`
- Indonesian: `id`

If one language is temporarily incomplete, the item should fail validation before release data is generated.

Use romaji only for first introduction or beginner-facing support. Do not make romaji the primary source field.

## Source Metadata

Content should track where it came from or how it should be studied.

Recommended source metadata:

- `primary_textbook`
- `depth_reference`
- `book_level`
- `section`
- `week`
- `day`
- `sequence`

Example:

```yaml
source_ref:
  primary_textbook: soumatome
  depth_reference: shinkanzen
  book_level: n3
  section: grammar
  week: 1
  day: 2
  sequence: 5
```

Do not treat source metadata as proof of copyright permission. Store only the metadata needed to organize study and cite references. Do not copy large textbook passages into the dataset.

## Verification

Human-authored and human-reviewed content can be marked `verified`.

AI-generated or AI-assisted content must be marked `unverified` until reviewed. Future tooling should preserve this flag through parsing, API responses, and database seeds.

Recommended verification fields:

- `status`: `verified` or `unverified`
- `source`: `manual`, `ai-assisted`, or `imported`
- `is_ai_generated`: boolean
- `is_verified`: boolean

## Item-Specific Rules

### Vocabulary

Vocabulary items should include:

- `writing`
- `reading`
- `meaning.en`
- `meaning.id`
- part-of-speech tags
- example sentence with Japanese, English, and Indonesian
- source metadata

### Kanji

Kanji items should include:

- `character`
- `meaning.en`
- `meaning.id`
- `onyomi`
- `kunyomi`
- common compounds
- source metadata

Kanji compounds may include kanji from earlier days or earlier levels. This is needed for natural reading and quiz generation.

Kanji list reference files should preserve:

- week title
- day title
- character
- on'yomi
- kun'yomi
- English meaning
- Indonesian meaning
- example words or compounds

### Grammar

Grammar items should include:

- `pattern`
- `formula`
- `meaning.en`
- `meaning.id`
- concise explanation in English and Indonesian
- example sentence with Japanese, English, and Indonesian
- nuance or common mistake notes when useful
- source metadata

## Indonesian Learner Notes

Items may include Indonesian-specific notes:

- patterns that are tricky for Indonesian speakers
- cases where Japanese has no direct Indonesian equivalent
- helpful Indonesian comparisons, such as `てから` roughly matching `setelah`
- false friends or common mistakes

Keep these notes concise and practical.

## Quiz Support

The dataset should contain enough structured information to generate quizzes later.

Quiz generation should be dataset-backed by default. The quiz service can randomize item order, question type, answer order, and distractors at request time without changing the source dataset.

Vocabulary quiz support:

- Japanese word
- reading
- English meaning
- Indonesian meaning
- example sentence

Kanji quiz support:

- single kanji meaning
- on'yomi and kun'yomi
- compound readings
- compound meanings in English and Indonesian

Grammar quiz support:

- pattern
- formula
- English explanation
- Indonesian explanation
- example sentence
- common wrong usage when available

AI-assisted quiz generation is allowed later, but AI-generated questions, distractors, explanations, or examples must be marked unverified unless reviewed.

Interactive quiz rules, one-question-at-a-time behavior, streaming behavior, and tool/button behavior belong in API/app/assistant instructions, not in the raw dataset.
