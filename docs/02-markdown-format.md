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
