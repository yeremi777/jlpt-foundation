# N5 Kanji Reference Audit

Audit target: `public/data/reference/n5/n5_kanji_list.md`
Rules checked: `docs/01-dataset-rules.md`
Audit date: 2026-06-02

Scope: each of the 108 N5 kanji table rows was inspected for the reference-file requirements in the dataset rules: week/day grouping, character, on'yomi, kun'yomi, English meaning, Indonesian meaning, and example words/compounds. This audit does not copy textbook passages and does not change the kanji data.

## Summary

- Rows inspected: 108 / 108.
- Week/day grouping present: yes, 1 week and 7 day sections.
- Required table fields present on every row: yes.
- English meaning present on every row: yes.
- Indonesian meaning present on every row: yes.
- On'yomi field present on every row: yes.
- Kun'yomi field present on every row: yes, but 7 rows use `—` to mean no common kun'yomi listed.
- Example field present on every row: yes.
- Verified row-level issues found: 6 rows have only one example, which is weak for the rule's `example words or compounds` / `common compounds` expectation.
- Global verified limitation: examples are surface forms only. The reference file does not include readings or English/Indonesian meanings for example words/compounds, so it is not sufficient by itself for the quiz-support requirement that compound readings and compound meanings be available later.

## Verified issues

These are definite gaps against the current project rules or the file's stated audit target.

- [ ] Line 49, `多`: only one example (`多い`). Add at least one more useful word/compound if this file is expected to support example-rich kanji practice.
- [ ] Line 55, `古`: only one example (`古い`). Add at least one more useful word/compound.
- [ ] Line 104, `天`: only one example (`天気`). Add at least one more useful word/compound.
- [ ] Line 106, `耳`: only one example (`耳`). Add at least one more useful word/compound.
- [ ] Line 111, `川`: only one example (`川`). Add at least one more useful word/compound.
- [ ] Line 117, `雨`: only one example (`雨`). Add at least one more useful word/compound.
- [ ] Global examples gap: example words/compounds lack readings and bilingual meanings. If generated raw/normalized kanji data depends on this reference, those fields need to be supplied elsewhere before quiz data can satisfy `compound readings` and `compound meanings in English and Indonesian`.

## Uncertain / needs human confirmation

These are not definite errors in the reference list, but they should be confirmed before treating the N5 kanji data as verified.

- [ ] Confirm whether `—` is the accepted project convention for kanji with no common N5 kun'yomi. Rows using it: line 37 `午`, line 41 `週`, line 43 `毎`, line 59 `校`, line 67 `駅`, line 96 `電`, line 105 `気`.
- [ ] Confirm whether reference rows are expected to include all common readings or only the readings useful for this N5 curriculum. Potentially abbreviated readings were noticed for common cases such as `分` not listing the `ぷん` sound-change variant explicitly, `十` not listing `ジュッ` explicitly, and examples like `今日`, `今年`, `今朝`, `大人`, `一人`, `二人`, `上手`, and `下手` having readings that are not obvious from the row readings alone.
- [ ] Confirm whether examples that are single-kanji words, kana-suffixed words, names, counters, or set readings count as `useful examples` without per-example readings. Examples include `田中さん`, `山田さん`, `〜本`, `今日`, `今年`, `今朝`, `大人`, `上手な`, `下手な`, and date/month examples.
- [ ] Confirm whether all example words should be restricted to N5 vocabulary. Some examples are common and useful but may be above N5 depending on the target list, such as `専門`, `空港`, `自動車`, `食料品`, `道路`, `西洋`, and `彼女`.

## Row-by-row inspection checklist

Legend: `OK` means the row has character, on'yomi, kun'yomi or explicit `—`, English meaning, Indonesian meaning, and at least one example. `Issue` means a verified issue is listed above. `Uncertain` means the row is structurally complete but has a convention or content-depth question listed above.

### Day 1 — People, Names, Country, Language

- [x] Line 12 `先`: OK.
- [x] Line 13 `生`: OK; uncertain whether only curriculum-relevant kun'yomi are intended.
- [x] Line 14 `学`: OK.
- [x] Line 15 `人`: OK; examples include special readings (`一人`, `二人`, `大人`) without per-example readings.
- [x] Line 16 `国`: OK.
- [x] Line 17 `男`: OK.
- [x] Line 18 `女`: OK.
- [x] Line 19 `子`: OK.
- [x] Line 20 `友`: OK.
- [x] Line 21 `父`: OK.
- [x] Line 22 `母`: OK.
- [x] Line 23 `名`: OK.
- [x] Line 24 `田`: OK; examples are names, so confirm this counts as useful example coverage.
- [x] Line 25 `山`: OK.
- [x] Line 26 `語`: OK.
- [x] Line 27 `本`: OK; counter example `〜本` needs reading support elsewhere because sound changes are not shown.

### Day 2 — Time Expressions

- [x] Line 32 `何`: OK.
- [x] Line 33 `時`: OK.
- [x] Line 34 `分`: OK structurally; uncertain whether `ぷん` should be listed explicitly for minute compounds.
- [x] Line 35 `間`: OK.
- [x] Line 36 `半`: OK.
- [x] Line 37 `午`: Uncertain convention: kun'yomi is `—`.
- [x] Line 38 `前`: OK.
- [x] Line 39 `後`: OK.
- [x] Line 40 `今`: OK; examples include special readings (`今日`, `今年`, `今朝`) without per-example readings.
- [x] Line 41 `週`: Uncertain convention: kun'yomi is `—`.
- [x] Line 42 `年`: OK.
- [x] Line 43 `毎`: Uncertain convention: kun'yomi is `—`.

### Day 3 — Paired Kanji and Adjectives

- [x] Line 48 `少`: OK.
- [ ] Line 49 `多`: Issue: only one example.
- [x] Line 50 `小`: OK.
- [x] Line 51 `大`: OK; examples include special reading `大人` without per-example reading.
- [x] Line 52 `安`: OK.
- [x] Line 53 `高`: OK.
- [x] Line 54 `新`: OK.
- [ ] Line 55 `古`: Issue: only one example.
- [x] Line 56 `早`: OK.
- [x] Line 57 `長`: OK.
- [x] Line 58 `円`: OK.
- [x] Line 59 `校`: Uncertain convention: kun'yomi is `—`.
- [x] Line 60 `社`: OK.
- [x] Line 61 `中`: OK.
- [x] Line 62 `聞`: OK.

### Day 4 — Places and Directions

- [x] Line 67 `駅`: Uncertain convention: kun'yomi is `—`.
- [x] Line 68 `口`: OK.
- [x] Line 69 `出`: OK.
- [x] Line 70 `入`: OK.
- [x] Line 71 `東`: OK.
- [x] Line 72 `西`: OK; confirm above-N5 examples such as `西洋` are acceptable if strict N5 vocabulary is required.
- [x] Line 73 `南`: OK.
- [x] Line 74 `北`: OK.
- [x] Line 75 `上`: OK; example `上手な` needs reading support elsewhere.
- [x] Line 76 `下`: OK; example `下手な` needs reading support elsewhere.
- [x] Line 77 `左`: OK.
- [x] Line 78 `右`: OK.
- [x] Line 79 `外`: OK.

### Day 5 — Basic Action Kanji

- [x] Line 84 `休`: OK.
- [x] Line 85 `見`: OK.
- [x] Line 86 `言`: OK.
- [x] Line 87 `行`: OK.
- [x] Line 88 `書`: OK.
- [x] Line 89 `読`: OK.
- [x] Line 90 `買`: OK.
- [x] Line 91 `来`: OK; examples include inflected forms that need reading support elsewhere.
- [x] Line 92 `立`: OK.
- [x] Line 93 `食`: OK; confirm above-N5 examples such as `食料品` are acceptable if strict N5 vocabulary is required.
- [x] Line 94 `飲`: OK.
- [x] Line 95 `会`: OK.
- [x] Line 96 `電`: Uncertain convention: kun'yomi is `—`.
- [x] Line 97 `話`: OK.
- [x] Line 98 `車`: OK; confirm above-N5 examples such as `自動車` are acceptable if strict N5 vocabulary is required.

### Day 6 — Body, Nature, Weather, Shops

- [x] Line 103 `花`: OK.
- [ ] Line 104 `天`: Issue: only one example.
- [x] Line 105 `気`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 106 `耳`: Issue: only one example.
- [x] Line 107 `手`: OK.
- [x] Line 108 `足`: OK.
- [x] Line 109 `目`: OK.
- [x] Line 110 `力`: OK.
- [ ] Line 111 `川`: Issue: only one example.
- [x] Line 112 `牛`: OK.
- [x] Line 113 `魚`: OK.
- [x] Line 114 `店`: OK.
- [x] Line 115 `道`: OK; confirm above-N5 examples such as `道路` are acceptable if strict N5 vocabulary is required.
- [x] Line 116 `門`: OK; confirm above-N5 examples such as `専門` are acceptable if strict N5 vocabulary is required.
- [ ] Line 117 `雨`: Issue: only one example.
- [x] Line 118 `空`: OK; confirm above-N5 examples such as `空港` are acceptable if strict N5 vocabulary is required.
- [x] Line 119 `白`: OK.

### Day 7 — Numbers, Dates, Calendar

- [x] Line 124 `一`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 125 `二`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 126 `三`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 127 `四`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 128 `五`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 129 `六`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 130 `七`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 131 `八`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 132 `九`: OK; examples include date/month readings that need per-example reading support elsewhere.
- [x] Line 133 `十`: OK structurally; uncertain whether `ジュッ` should be listed explicitly alongside `ジッ`.
- [x] Line 134 `百`: OK.
- [x] Line 135 `千`: OK.
- [x] Line 136 `万`: OK.
- [x] Line 137 `月`: OK; examples include month/month-name readings that need per-example reading support elsewhere.
- [x] Line 138 `日`: OK; examples include date/day readings that need per-example reading support elsewhere.
- [x] Line 139 `火`: OK.
- [x] Line 140 `水`: OK.
- [x] Line 141 `木`: OK.
- [x] Line 142 `金`: OK.
- [x] Line 143 `土`: OK.

## Validation run

`pnpm validate:reference` passed after the audit was written:

```text
Reference validation passed
{
  "curriculumEntries": 522,
  "kanjiEntries": 642,
  "quizPoolItems": 998
}
```
