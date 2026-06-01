# Markdown Format

Raw learning content lives in `data/raw/<level>/<type>/` as markdown files.

Each file should use YAML frontmatter followed by a short human-readable body. The frontmatter is intended for parsing; the body is intended for review and authoring.

Reference markdown lives in `data/reference/<level>/`. Reference files are allowed to use larger tables because they describe curriculum structure or source lists, not individual item pages.

## Common Frontmatter

```yaml
---
id: n5-vocab-mizu
level: n5
type: vocab
status: verified
source: manual
is_ai_generated: false
is_verified: true
source_ref:
  primary_textbook: soumatome
  depth_reference: shinkanzen
  book_level: n5
  section: vocab
  week: null
  day: null
  sequence: 1
tags:
  - common
---
```

Allowed `status` values:

- `verified`
- `unverified`

Allowed `source` values:

- `manual`
- `ai-assisted`
- `imported`

## Rendering Rules

These rules keep markdown compatible with Claude/project instructions, future API rendering, and review artifacts.

- Labels such as `Formula`, `EN`, `ID`, `音`, `訓`, `Source`, `Example`, and `Examples` should be bold in the markdown body.
- Values after a label should be plain text.
- Separate label-value pairs with a blank line when the label appears in the body.
- Never put Japanese, English, and Indonesian example lines on the same line.
- Example blocks should use this order:
  - Japanese
  - English
  - Indonesian
- Indent example lines with the ideographic space `　` when writing display-ready examples.
- Use readings on first introduction.
- Use romaji only when the item is introduced to a beginner-facing context.

## Reference File Formats

Reference files are level-specific and should be parseable without manual cleanup.

### Curriculum TOC

Recommended location:

```text
data/reference/n3/n3_curriculum_toc.md
```

The curriculum TOC may use markdown tables for sections such as grammar, vocabulary, and kanji.

Grammar table columns should be parseable as:

```text
ID | Day | Pattern | Reading | English | Indonesian | Formula | Diff | Src
```

Vocabulary topic table columns should be parseable as:

```text
ID | Day | Topic | English | Indonesian
```

Kanji curriculum topic table columns should be parseable as:

```text
ID | Day | Topic | English | Indonesian
```

Allowed `Src` values:

- `S`
- `K`
- `B`

Allowed `Diff` values:

- `easy`
- `medium`
- `hard`

### Kanji List

Recommended location:

```text
data/reference/n3/n3_kanji_list.md
```

Kanji list tables should be parseable as:

```text
Kanji | On | Kun | English | Indonesian | Examples
```

Use `—` when a reading is unavailable. Parsers should normalize this into an empty list.

Example words can begin as comma-separated text in the reference file, then become structured compounds during normalization.

## Vocabulary

Vocabulary raw markdown should remain documentation-only until kanji tooling is stable. Do not add production vocabulary records, parser behavior, or external scraping requirements as part of the first vocabulary fixture task.

### First Raw Vocabulary Fixture

The first vocabulary work item should create exactly one small raw markdown test fixture for parser and validator design only. It should be hand-authored, local, and intentionally minimal so one focused agent run can add the fixture and its tests without expanding the production dataset.

Recommended fixture location:

```text
data/raw/n5/vocab/fixtures/n5-vocab-fixture-001.md
```

Fixture constraints:

- Use one N5 vocabulary item only.
- Treat the fixture as test data, not production learning content.
- Do not add real vocabulary records to the production raw dataset in the same task.
- Do not fetch, scrape, or copy from external websites or textbooks.
- Use concise original English and Indonesian meanings.
- Use `source: manual` and `is_ai_generated: false`.
- Keep `source_ref.week` and `source_ref.day` as `null` unless a curated local reference already provides them.
- Include no more than one example sentence block.
- Avoid advanced vocabulary fields until the minimal shape validates.

Minimum frontmatter fields for the fixture:

```yaml
---
id: n5-vocab-fixture-001
level: n5
type: vocab
writing: <japanese-writing-or-kana>
reading: <kana-reading>
romaji: <romaji-reading>
meaning:
  en: <short-english-meaning>
  id: <short-indonesian-meaning>
part_of_speech:
  - <controlled-part-of-speech>
status: unverified
source: manual
is_ai_generated: false
is_verified: false
source_ref:
  primary_textbook: manual
  depth_reference: manual
  book_level: n5
  section: vocab
  week: null
  day: null
  sequence: 1
tags:
  - fixture
---
```

Required body structure:

```md
## <writing>（<reading>）

**EN:** <short-english-meaning>

**ID:** <short-indonesian-meaning>

**Example:**

　<japanese-example>

　<english-example>

　<indonesian-example>

**Source:** Manual fixture
```

Validator requirements for the first fixture:

- `id` must be unique and start with `n5-vocab-`.
- `level` must be `n5` for the first fixture.
- `type` must be `vocab`.
- `writing`, `reading`, `romaji`, `meaning.en`, and `meaning.id` must be non-empty strings.
- `part_of_speech` must be a non-empty list of controlled values such as `noun`, `verb`, `adjective`, `adverb`, or `expression`.
- `status` must be `verified` or `unverified`; the first fixture should use `unverified`.
- `source` must be one of the common allowed source values; the first fixture should use `manual`.
- `is_verified` should match `status: verified` only when the item has been reviewed.
- The markdown body must include `EN`, `ID`, `Example`, and `Source` labels using the rendering rules above.
- Example lines must stay on separate Japanese, English, and Indonesian lines.

Expected normalized representation, at spec level only:

```json
{
  "id": "n5-vocab-fixture-001",
  "level": "n5",
  "type": "vocab",
  "writing": "<japanese-writing-or-kana>",
  "reading": "<kana-reading>",
  "romaji": "<romaji-reading>",
  "meaning": {
    "en": "<short-english-meaning>",
    "id": "<short-indonesian-meaning>"
  },
  "partOfSpeech": ["<controlled-part-of-speech>"],
  "status": "unverified",
  "source": "manual",
  "isAiGenerated": false,
  "isVerified": false,
  "sourceRef": {
    "primaryTextbook": "manual",
    "depthReference": "manual",
    "bookLevel": "n5",
    "section": "vocab",
    "week": null,
    "day": null,
    "sequence": 1
  },
  "tags": ["fixture"],
  "examples": [
    {
      "ja": "<japanese-example>",
      "en": "<english-example>",
      "id": "<indonesian-example>"
    }
  ]
}
```

The normalized output expectation above documents the target shape only. It must not require parser or generator implementation in the fixture-spec task.

### Vocabulary Item Example

```yaml
---
id: n5-vocab-mizu
level: n5
type: vocab
writing: 水
reading: みず
romaji: mizu
meaning:
  en: water
  id: air
part_of_speech:
  - noun
status: verified
source: manual
is_ai_generated: false
is_verified: true
source_ref:
  primary_textbook: soumatome
  depth_reference: shinkanzen
  book_level: n5
  section: vocab
  week: null
  day: null
  sequence: 1
tags:
  - noun
---
```

Recommended body:

```md
## 水（みず）

**EN:** water

**ID:** air

**Example:**

　水を飲みます。

　I drink water.

　Saya minum air.

**Source:** Soumatome N5 Vocabulary
```

## Kanji

```yaml
---
id: n5-kanji-mizu
level: n5
type: kanji
character: 水
meaning:
  en: water
  id: air
onyomi:
  - スイ
kunyomi:
  - みず
compounds:
  - writing: 水
    reading: みず
    meaning:
      en: water
      id: air
status: verified
source: manual
is_ai_generated: false
is_verified: true
source_ref:
  primary_textbook: soumatome
  depth_reference: shinkanzen
  book_level: n5
  section: kanji
  week: null
  day: null
  sequence: 1
tags:
  - nature
---
```

Recommended body:

```md
## 水

**音:** スイ

**訓:** みず

**EN:** water

**ID:** air

**Examples:**

## 水（みず）

　water / air

**Source:** Soumatome N5 Kanji
```

## Grammar

```yaml
---
id: n5-grammar-desu
level: n5
type: grammar
pattern: です
formula: Noun + です
meaning:
  en: polite sentence ending / to be
  id: akhiran kalimat sopan / adalah
explanation:
  en: Used to make simple polite statements.
  id: Digunakan untuk membuat pernyataan sederhana yang sopan.
indonesian_notes:
  - Often translates naturally as "adalah", but Indonesian often omits it.
status: verified
source: manual
is_ai_generated: false
is_verified: true
source_ref:
  primary_textbook: soumatome
  depth_reference: shinkanzen
  book_level: n5
  section: grammar
  week: null
  day: null
  sequence: 1
tags:
  - copula
---
```

Recommended body:

```md
## です

**Formula:** Noun + です

**EN:** polite sentence ending / to be

**ID:** akhiran kalimat sopan / adalah

**Explanation EN:** Used to make simple polite statements.

**Explanation ID:** Digunakan untuk membuat pernyataan sederhana yang sopan.

**Example:**

　学生です。

　I am a student.

　Saya adalah pelajar.

**Source:** Soumatome N5 Grammar
```

### First Grammar Raw Markdown Fixture

After kanji and vocabulary raw-data gates are clear, the first grammar dataset task should add one small markdown fixture before any production grammar expansion.

Recommended fixture location:

```text
tests/fixtures/raw/grammar/n5-grammar-noun-desu.md
```

The fixture should represent one beginner grammar structure only:

```text
Noun + です
```

Purpose:

- verify that a grammar raw markdown file can carry frontmatter plus a short reviewable body
- keep the first grammar parser/validator task focused on one item shape
- avoid copying large textbook explanations or example passages
- make the represented structure clear without starting production grammar collection

Fixture content:

```md
---
id: n5-grammar-noun-desu
level: n5
type: grammar
pattern: です
formula: Noun + です
meaning:
  en: polite sentence ending / to be
  id: akhiran kalimat sopan / adalah
explanation:
  en: Used to make a simple polite noun sentence.
  id: Digunakan untuk membuat kalimat nominal sederhana yang sopan.
indonesian_notes:
  - In natural Indonesian, "adalah" may be omitted.
status: unverified
source: manual
is_ai_generated: false
is_verified: false
source_ref:
  primary_textbook: manual
  depth_reference: manual
  book_level: n5
  section: grammar
  week: null
  day: null
  sequence: 1
tags:
  - fixture
  - copula
---

## です

**Formula:** Noun + です

**EN:** polite sentence ending / to be

**ID:** akhiran kalimat sopan / adalah

**Explanation EN:** Used to make a simple polite noun sentence.

**Explanation ID:** Digunakan untuk membuat kalimat nominal sederhana yang sopan.

**Example:**

　学生です。

　I am a student.

　Saya pelajar.

**Source:** Manual fixture
```

Validator requirements for the first grammar fixture:

- Accept exactly one markdown file at `tests/fixtures/raw/grammar/n5-grammar-noun-desu.md` for this first fixture scenario.
- Require valid YAML frontmatter followed by a markdown body.
- Required frontmatter fields:
  - `id`
  - `level`
  - `type`
  - `pattern`
  - `formula`
  - `meaning.en`
  - `meaning.id`
  - `explanation.en`
  - `explanation.id`
  - `status`
  - `source`
  - `is_ai_generated`
  - `is_verified`
  - `source_ref.primary_textbook`
  - `source_ref.depth_reference`
  - `source_ref.book_level`
  - `source_ref.section`
  - `source_ref.week`
  - `source_ref.day`
  - `source_ref.sequence`
  - `tags`
- Optional frontmatter fields for this fixture:
  - `indonesian_notes`
- `id` must be `n5-grammar-noun-desu` for this fixture and must follow the `n5-grammar-` prefix convention.
- `level` must be `n5`.
- `type` must be `grammar`.
- `pattern`, `formula`, `meaning.en`, `meaning.id`, `explanation.en`, and `explanation.id` must be non-empty strings.
- `formula` must be `Noun + です` for this fixture.
- `pattern` must be `です` for this fixture.
- `indonesian_notes`, when present, must be a list of non-empty strings.
- `status` must be `verified` or `unverified`; this fixture must use `unverified`.
- `source` must be one of the common allowed source values; this fixture must use `manual`.
- `is_ai_generated` must be `false`.
- `is_verified` must be `false` while `status` is `unverified`.
- `source_ref.primary_textbook` and `source_ref.depth_reference` must be `manual` for this fixture.
- `source_ref.book_level` must match `level`.
- `source_ref.section` must be `grammar`.
- `source_ref.week` and `source_ref.day` must be `null` unless a curated local reference later provides exact values.
- `source_ref.sequence` must be a positive integer.
- `tags` must be a non-empty list and must include `fixture`; this fixture should also include `copula`.
- The markdown body must include `Formula`, `EN`, `ID`, `Explanation EN`, `Explanation ID`, `Example`, and `Source` labels using the rendering rules above.
- The body heading must be `## です` for this fixture.
- The body formula, meanings, and explanations must match the corresponding frontmatter values.
- The example block must contain exactly three display lines in this order: Japanese, English, Indonesian.
- Reject files that add production-only fields, multiple grammar items, multiple example blocks, scraped textbook passages, or implementation instructions.

Expected normalized representation for the fixture, at spec level only:

```json
{
  "id": "n5-grammar-noun-desu",
  "level": "n5",
  "type": "grammar",
  "pattern": "です",
  "formula": "Noun + です",
  "meaning": {
    "en": "polite sentence ending / to be",
    "id": "akhiran kalimat sopan / adalah"
  },
  "explanation": {
    "en": "Used to make a simple polite noun sentence.",
    "id": "Digunakan untuk membuat kalimat nominal sederhana yang sopan."
  },
  "indonesianNotes": [
    "In natural Indonesian, \"adalah\" may be omitted."
  ],
  "status": "unverified",
  "source": "manual",
  "isAiGenerated": false,
  "isVerified": false,
  "sourceRef": {
    "primaryTextbook": "manual",
    "depthReference": "manual",
    "bookLevel": "n5",
    "section": "grammar",
    "week": null,
    "day": null,
    "sequence": 1
  },
  "tags": ["fixture", "copula"],
  "examples": [
    {
      "ja": "学生です。",
      "en": "I am a student.",
      "id": "Saya pelajar."
    }
  ]
}
```

The normalized representation should use camelCase for normalized object keys, preserve Japanese text exactly, trim display indentation from example lines, and keep `week` and `day` as `null`. The normalized output expectation above documents the target shape only. It must not require parser, validator, or generator implementation in the fixture-spec task.

This fixture is only for the first grammar raw markdown test. It should not be copied into `data/raw/<level>/grammar/` or treated as a verified production grammar record until a later task explicitly scopes production grammar collection.

## Source Field Guidelines

Use source labels consistently:

- `soumatome`
- `shinkanzen`
- `manual`
- `other`

Use `null` for unknown week/day values instead of inventing numbers.

Do not store long copyrighted explanations from textbooks. Store concise original notes and citation metadata.

## Progress Log Format

Progress logs are not source markdown. They are future generated artifacts based on user sessions.

The future progress/session log format should support:

- date
- section
- week
- day
- session title
- score
- status
- mastered or reviewed items
- quiz type breakdown
- retry/focused-review notes
- next session suggestion

The progress log can use a human-readable markdown style, but the database should store structured progress events first.
