# N4 Kanji Reference Audit

Audit target: `public/data/reference/n4/n4_kanji_list.md`
Rules checked: `docs/01-dataset-rules.md`
Audit date: 2026-06-02

Scope: each of the 198 N4 kanji table rows was inspected for the reference-file requirements in the dataset rules: week/day grouping, character, on'yomi, kun'yomi, English meaning, Indonesian meaning, and example words/compounds. This audit does not copy textbook passages and does not change the kanji data.

## Summary

- Rows inspected: 198 / 198.
- Week/day grouping present: yes, 3 weeks and 21 day sections.
- Required table fields present on every row: yes.
- English meaning present on every row: yes.
- Indonesian meaning present on every row: yes.
- On'yomi field present on every row: yes.
- Kun'yomi field present on every row: yes, but 41 rows use `—` to mean no common kun'yomi listed.
- Example field present on every row: yes.
- Verified row-level issues found: 36 rows have only one example, which is weak for the rule's `example words or compounds` / `common compounds` expectation.
- Global verified limitation: examples are surface forms only. The reference file does not include readings or English/Indonesian meanings for example words/compounds, so it is not sufficient by itself for the quiz-support requirement that compound readings and compound meanings be available later. Existing normalized N4 kanji data mirrors the same example strings, so this limitation is verifiable from project-approved files.

## Verified issues

These are definite gaps against the current project rules or the file's stated audit target. Each row below has only one example; add at least one more useful word/compound if this reference file is expected to support example-rich kanji practice. This is verifiable from the current N4 reference file.

- [ ] Line 29, `勉`: only one example (`勉強する`).
- [ ] Line 40, `低`: only one example (`低い`).
- [ ] Line 41, `短`: only one example (`短い`).
- [ ] Line 44, `弱`: only one example (`弱い`).
- [ ] Line 46, `暗`: only one example (`暗い`).
- [ ] Line 48, `悪`: only one example (`悪い`).
- [ ] Line 56, `有`: only one example (`有名な`).
- [ ] Line 85, `秋`: only one example (`秋`).
- [ ] Line 89, `府`: only one example (`都道府県`).
- [ ] Line 102, `菜`: only one example (`野菜`).
- [ ] Line 128, `犬`: only one example (`犬`).
- [ ] Line 130, `区`: only one example (`区`).
- [ ] Line 143, `寒`: only one example (`寒い`).
- [ ] Line 145, `重`: only one example (`重い`).
- [ ] Line 146, `軽`: only one example (`軽い`).
- [ ] Line 147, `広`: only one example (`広い`).
- [ ] Line 148, `元`: only one example (`元気な`).
- [ ] Line 158, `研`: only one example (`研究する`).
- [ ] Line 186, `妹`: only one example (`妹`).
- [ ] Line 193, `首`: only one example (`首`).
- [ ] Line 194, `顔`: only one example (`顔`).
- [ ] Line 195, `頭`: only one example (`頭`).
- [ ] Line 228, `林`: only one example (`林`).
- [ ] Line 229, `村`: only one example (`村`).
- [ ] Line 230, `森`: only one example (`森`).
- [ ] Line 232, `濯`: only one example (`洗濯する`).
- [ ] Line 233, `質`: only one example (`質問する`).
- [ ] Line 241, `借`: only one example (`借りる`).
- [ ] Line 242, `貸`: only one example (`貸す`).
- [ ] Line 252, `体`: only one example (`体`).
- [ ] Line 260, `考`: only one example (`考える`).
- [ ] Line 262, `声`: only one example (`声`).
- [ ] Line 268, `漢`: only one example (`漢字`).
- [ ] Line 281, `銀`: only one example (`銀行`).
- [ ] Line 285, `走`: only one example (`走る`).
- [ ] Line 292, `英`: only one example (`英語`).
- [ ] Global examples gap: example words/compounds lack readings and bilingual meanings. If generated raw/normalized kanji data depends on this reference, those fields need to be supplied elsewhere before quiz data can satisfy `compound readings` and `compound meanings in English and Indonesian`.

## Uncertain / needs human confirmation

These are not definite errors in the reference list, but they should be confirmed before treating the N4 kanji data as verified. The gaps are visible in existing project-approved files, but the correct replacement content is not verifiable from those files alone.

- [ ] Confirm whether `—` is the accepted project convention for kanji with no common N4 kun'yomi. Rows using it: line 21 `台`, line 28 `晩`, line 29 `勉`, line 32 `文`, line 49 `利`, line 55 `館`, line 68 `医`, line 70 `員`, line 87 `京`, line 89 `府`, line 90 `県`, line 97 `料`, line 98 `理`, line 104 `肉`, line 114 `画`, line 122 `鉄`, line 130 `区`, line 134 `族`, line 158 `研`, line 163 `意`, line 167 `工`, line 173 `以`, line 176 `号`, line 177 `番`, line 180 `洋`, line 181 `服`, line 214 `部`, line 220 `界`, line 227 `特`, line 231 `曜`, line 232 `濯`, line 233 `質`, line 235 `題`, line 247 `不`, line 259 `験`, line 268 `漢`, line 281 `銀`, line 282 `堂`, line 283 `院`, line 292 `英`, line 293 `茶`.
- [ ] Confirm whether reference rows are expected to include all common readings or only the readings useful for this N4 curriculum. The current project-approved files do not provide a second reviewed reading source, so reading completeness beyond the listed values is not verifiable in this pass.
- [ ] Confirm whether examples that are single-kanji words, kana-suffixed words, counters, names/places, set phrases, or multi-kanji compounds count as `useful examples` without per-example readings. Examples include rows such as `台` (`1台`), `京` (`京都`, `東京`), `府` (`都道府県`), `区` (`区`), and `漢` (`漢字`).
- [ ] Confirm whether all example words should be restricted to N4 vocabulary. The dataset rules allow kanji compounds from earlier days or levels, but do not say whether above-level examples are acceptable in the reference list.

## Row-by-row inspection checklist

Legend: `OK` means the row has character, on'yomi, kun'yomi or explicit `—`, English meaning, Indonesian meaning, and at least one example. `Issue` means a verified issue is listed above. `Uncertain` means the row is structurally complete but has a convention or content-depth question listed above.

### Week 1, Day 1 — 通う・通る (Kanji with Many Readings)

- [x] Line 12 `通`: OK.
- [x] Line 13 `降`: OK.
- [x] Line 14 `品`: OK.
- [x] Line 15 `着`: OK.
- [x] Line 16 `物`: OK.
- [x] Line 17 `動`: OK.
- [x] Line 18 `建`: OK.
- [x] Line 19 `夜`: OK.
- [x] Line 20 `風`: OK.
- [x] Line 21 `台`: Uncertain convention: kun'yomi is `—`.

### Week 1, Day 2 — 同・何・回 (Similar-looking Kanji)

- [x] Line 26 `同`: OK.
- [x] Line 27 `回`: OK.
- [x] Line 28 `晩`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 29 `勉`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 30 `進`: OK.
- [x] Line 31 `集`: OK.
- [x] Line 32 `文`: Uncertain convention: kun'yomi is `—`.
- [x] Line 33 `作`: OK.
- [x] Line 34 `使`: OK.
- [x] Line 35 `便`: OK.

### Week 1, Day 3 — 長い ↔ 短い (Learn as Pairs)

- [ ] Line 40 `低`: Issue: only one example.
- [ ] Line 41 `短`: Issue: only one example.
- [x] Line 42 `近`: OK.
- [x] Line 43 `遠`: OK.
- [ ] Line 44 `弱`: Issue: only one example.
- [x] Line 45 `強`: OK.
- [ ] Line 46 `暗`: Issue: only one example.
- [x] Line 47 `明`: OK.
- [ ] Line 48 `悪`: Issue: only one example.
- [x] Line 49 `利`: Uncertain convention: kun'yomi is `—`.

### Week 1, Day 4 — 旅行・有名 (Pronunciation-focused Kanji)

- [x] Line 54 `旅`: OK.
- [x] Line 55 `館`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 56 `有`: Issue: only one example.
- [x] Line 57 `去`: OK.
- [x] Line 58 `主`: OK.
- [x] Line 59 `写`: OK.
- [x] Line 60 `真`: OK.
- [x] Line 61 `夕`: OK.
- [x] Line 62 `飯`: OK.
- [x] Line 63 `方`: OK.

### Week 1, Day 5 — 医者・歌手 (Kanji that Describe People)

- [x] Line 68 `医`: Uncertain convention: kun'yomi is `—`.
- [x] Line 69 `者`: OK.
- [x] Line 70 `員`: Uncertain convention: kun'yomi is `—`.
- [x] Line 71 `民`: OK.
- [x] Line 72 `歌`: OK.
- [x] Line 73 `運`: OK.
- [x] Line 74 `転`: OK.
- [x] Line 75 `説`: OK.
- [x] Line 76 `家`: OK.

### Week 1, Day 6 — 東・西・南・北 (Learn as Groups)

- [x] Line 81 `朝`: OK.
- [x] Line 82 `昼`: OK.
- [x] Line 83 `春`: OK.
- [x] Line 84 `夏`: OK.
- [ ] Line 85 `秋`: Issue: only one example.
- [x] Line 86 `冬`: OK.
- [x] Line 87 `京`: Uncertain convention: kun'yomi is `—`.
- [x] Line 88 `都`: OK.
- [ ] Line 89 `府`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 90 `県`: Uncertain convention: kun'yomi is `—`.
- [x] Line 91 `市`: OK.
- [x] Line 92 `町`: OK.

### Week 1, Day 7 — 料理のレシピ (Cooking Recipes)

- [x] Line 97 `料`: Uncertain convention: kun'yomi is `—`.
- [x] Line 98 `理`: Uncertain convention: kun'yomi is `—`.
- [x] Line 99 `米`: OK.
- [x] Line 100 `洗`: OK.
- [x] Line 101 `野`: OK.
- [ ] Line 102 `菜`: Issue: only one example.
- [x] Line 103 `酒`: OK.
- [x] Line 104 `肉`: Uncertain convention: kun'yomi is `—`.
- [x] Line 105 `味`: OK.

### Week 2, Day 1 — 映画・計画 (Learn Readings through Words)

- [x] Line 114 `画`: Uncertain convention: kun'yomi is `—`.
- [x] Line 115 `映`: OK.
- [x] Line 116 `計`: OK.
- [x] Line 117 `図`: OK.
- [x] Line 118 `事`: OK.
- [x] Line 119 `仕`: OK.
- [x] Line 120 `用`: OK.
- [x] Line 121 `地`: OK.
- [x] Line 122 `鉄`: Uncertain convention: kun'yomi is `—`.

### Week 2, Day 2 — 大・犬・太 (Similar-looking Kanji)

- [x] Line 127 `大`: OK.
- [ ] Line 128 `犬`: Issue: only one example.
- [x] Line 129 `太`: OK.
- [ ] Line 130 `区`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 131 `思`: OK.
- [x] Line 132 `知`: OK.
- [x] Line 133 `和`: OK.
- [x] Line 134 `族`: Uncertain convention: kun'yomi is `—`.
- [x] Line 135 `青`: OK.
- [x] Line 136 `光`: OK.
- [x] Line 137 `池`: OK.
- [x] Line 138 `別`: OK.

### Week 2, Day 3 — 起きる ↔ 寝る (Learn as Pairs)

- [ ] Line 143 `寒`: Issue: only one example.
- [x] Line 144 `暑`: OK.
- [ ] Line 145 `重`: Issue: only one example.
- [ ] Line 146 `軽`: Issue: only one example.
- [ ] Line 147 `広`: Issue: only one example.
- [ ] Line 148 `元`: Issue: only one example.
- [x] Line 149 `病`: OK.
- [x] Line 150 `起`: OK.
- [x] Line 151 `寝`: OK.
- [x] Line 152 `始`: OK.
- [x] Line 153 `終`: OK.

### Week 2, Day 4 — 発音・注意 (Pronunciation-focused Kanji)

- [ ] Line 158 `研`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 159 `究`: OK.
- [x] Line 160 `住`: OK.
- [x] Line 161 `所`: OK.
- [x] Line 162 `注`: OK.
- [x] Line 163 `意`: Uncertain convention: kun'yomi is `—`.
- [x] Line 164 `教`: OK.
- [x] Line 165 `発`: OK.
- [x] Line 166 `音`: OK.
- [x] Line 167 `工`: Uncertain convention: kun'yomi is `—`.
- [x] Line 168 `業`: OK.

### Week 2, Day 5 — 号・番・全 (Kanji Used to Form Words)

- [x] Line 173 `以`: Uncertain convention: kun'yomi is `—`.
- [x] Line 174 `内`: OK.
- [x] Line 175 `代`: OK.
- [x] Line 176 `号`: Uncertain convention: kun'yomi is `—`.
- [x] Line 177 `番`: Uncertain convention: kun'yomi is `—`.
- [x] Line 178 `度`: OK.
- [x] Line 179 `全`: OK.
- [x] Line 180 `洋`: Uncertain convention: kun'yomi is `—`.
- [x] Line 181 `服`: Uncertain convention: kun'yomi is `—`.

### Week 2, Day 6 — 赤・白・黄 (Learn as Groups)

- [ ] Line 186 `妹`: Issue: only one example.
- [x] Line 187 `好`: OK.
- [x] Line 188 `弟`: OK.
- [x] Line 189 `赤`: OK.
- [x] Line 190 `黄`: OK.
- [x] Line 191 `色`: OK.
- [x] Line 192 `黒`: OK.
- [ ] Line 193 `首`: Issue: only one example.
- [ ] Line 194 `顔`: Issue: only one example.
- [ ] Line 195 `頭`: Issue: only one example.

### Week 2, Day 7 — 建物の中のサイン (Signs in a Building)

- [x] Line 200 `取`: OK.
- [x] Line 201 `押`: OK.
- [x] Line 202 `引`: OK.
- [x] Line 203 `開`: OK.
- [x] Line 204 `閉`: OK.
- [x] Line 205 `止`: OK.

### Week 3, Day 1 — 部屋・土産 (Special Readings)

- [x] Line 214 `部`: Uncertain convention: kun'yomi is `—`.
- [x] Line 215 `屋`: OK.
- [x] Line 216 `産`: OK.
- [x] Line 217 `姉`: OK.
- [x] Line 218 `兄`: OK.
- [x] Line 219 `世`: OK.
- [x] Line 220 `界`: Uncertain convention: kun'yomi is `—`.

### Week 3, Day 2 — 持・待・特 (Kanji with the Same Radicals)

- [x] Line 225 `持`: OK.
- [x] Line 226 `待`: OK.
- [x] Line 227 `特`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 228 `林`: Issue: only one example.
- [ ] Line 229 `村`: Issue: only one example.
- [ ] Line 230 `森`: Issue: only one example.
- [x] Line 231 `曜`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 232 `濯`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [ ] Line 233 `質`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 234 `問`: OK.
- [x] Line 235 `題`: Uncertain convention: kun'yomi is `—`.

### Week 3, Day 3 — 習う ↔ 教える (Learn as Pairs)

- [x] Line 240 `売`: OK.
- [ ] Line 241 `借`: Issue: only one example.
- [ ] Line 242 `貸`: Issue: only one example.
- [x] Line 243 `習`: OK.
- [x] Line 244 `座`: OK.
- [x] Line 245 `乗`: OK.
- [x] Line 246 `死`: OK.
- [x] Line 247 `不`: Uncertain convention: kun'yomi is `—`.

### Week 3, Day 4 — 体・薬 (Pronunciation and Writing)

- [ ] Line 252 `体`: Issue: only one example.
- [x] Line 253 `働`: OK.
- [x] Line 254 `薬`: OK.
- [x] Line 255 `奥`: OK.
- [x] Line 256 `正`: OK.
- [x] Line 257 `急`: OK.
- [x] Line 258 `試`: OK.
- [x] Line 259 `験`: Uncertain convention: kun'yomi is `—`.
- [ ] Line 260 `考`: Issue: only one example.
- [x] Line 261 `心`: OK.
- [ ] Line 262 `声`: Issue: only one example.

### Week 3, Day 5 — 親切・切手 (Kanji Combinations)

- [x] Line 267 `合`: OK.
- [ ] Line 268 `漢`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 269 `字`: OK.
- [x] Line 270 `親`: OK.
- [x] Line 271 `切`: OK.
- [x] Line 272 `楽`: OK.
- [x] Line 273 `自`: OK.
- [x] Line 274 `場`: OK.
- [x] Line 275 `室`: OK.

### Week 3, Day 6 — 海・山・空・川 (Learn as Groups)

- [x] Line 280 `鳥`: OK.
- [ ] Line 281 `銀`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 282 `堂`: Uncertain convention: kun'yomi is `—`.
- [x] Line 283 `院`: Uncertain convention: kun'yomi is `—`.
- [x] Line 284 `歩`: OK.
- [ ] Line 285 `走`: Issue: only one example.
- [x] Line 286 `海`: OK.
- [x] Line 287 `帰`: OK.

### Week 3, Day 7 — 漢字の部分の名前 (Names of Kanji Radicals)

- [ ] Line 292 `英`: Issue: only one example; Uncertain convention: kun'yomi is `—`.
- [x] Line 293 `茶`: Uncertain convention: kun'yomi is `—`.
- [x] Line 294 `答`: OK.
- [x] Line 295 `紙`: OK.
- [x] Line 296 `私`: OK.
- [x] Line 297 `送`: OK.

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
