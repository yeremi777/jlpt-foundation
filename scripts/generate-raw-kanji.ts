import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseLevelReferences } from "./lib/reference-parser.js";
import { CurriculumEntry, JlptLevel, KanjiReferenceEntry } from "./lib/reference-types.js";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const rawDir = path.join(rootDir, "data/raw");
const levels: readonly JlptLevel[] = ["n5", "n4", "n3"];

await rm(rawDir, { recursive: true, force: true });

const generated: Record<string, number> = {};

for (const level of levels) {
  const data = await parseLevelReferences(level);
  const outputDir = path.join(rawDir, `${level}/kanji`);
  const curriculumByWeekDay = buildKanjiCurriculumMap(data.curriculum);

  await mkdir(outputDir, { recursive: true });

  for (const entry of data.kanji) {
    const curriculum = curriculumByWeekDay.get(`${entry.week}:${entry.day}`);
    const filePath = path.join(outputDir, `${fileSlug(entry)}.md`);
    await writeFile(filePath, renderKanjiMarkdown(entry, curriculum), "utf8");
  }

  generated[level] = data.kanji.length;
}

console.log("Generated raw kanji markdown files");
console.log(JSON.stringify(
  {
    generated,
    rawDir,
    sources: levels.map((level) => `data/reference/${level}/${level}_kanji_list.md`),
  },
  null,
  2,
));

function buildKanjiCurriculumMap(curriculum: readonly CurriculumEntry[]): Map<string, CurriculumEntry> {
  const byWeekDay = new Map<string, CurriculumEntry>();

  for (const entry of curriculum) {
    if (entry.section === "kanji" && entry.source === "soumatome" && entry.week && entry.day) {
      byWeekDay.set(`${entry.week}:${entry.day}`, entry);
    }
  }

  return byWeekDay;
}

function renderKanjiMarkdown(entry: KanjiReferenceEntry, curriculum: CurriculumEntry | undefined): string {
  return `---
id: ${entry.id}
${curriculum ? `curriculum_id: ${curriculum.curriculumId}\n` : ""}level: ${entry.level}
type: kanji
character: ${entry.character}
meaning:
  en: ${entry.meaning.en}
  id: ${entry.meaning.id}
${renderYamlArrayField("onyomi", entry.onyomi)}
${renderYamlArrayField("kunyomi", entry.kunyomi)}
status: unverified
source: imported
is_ai_generated: false
is_verified: false
source_ref:
  primary_textbook: soumatome
  depth_reference: ${entry.level === "n4" ? "minna-no-nihongo" : "shinkanzen"}
  book_level: ${entry.level}
  section: kanji
  week: ${entry.week}
  day: ${entry.day}
  sequence: ${entry.sequence}
tags:
  - kanji
  - soumatome
  - week-${entry.week}
  - day-${entry.day}
---

## ${entry.character}

**音:** ${entry.onyomi.length ? entry.onyomi.join("、") : "-"}

**訓:** ${entry.kunyomi.length ? entry.kunyomi.join("、") : "-"}

**EN:** ${entry.meaning.en}

**ID:** ${entry.meaning.id}

**Examples:**

${entry.examples.map((example) => `- ${example}`).join("\n")}

**Source:** Soumatome ${entry.level.toUpperCase()} Kanji Week ${entry.week} Day ${entry.day} — ${entry.dayTitle}
`;
}

function renderYamlArrayField(key: string, items: readonly string[]): string {
  if (items.length === 0) {
    return `${key}: []`;
  }
  return `${key}:\n${renderYamlList(items)}`;
}

function renderYamlList(items: readonly string[]): string {
  return items.map((item) => `  - ${item}`).join("\n");
}

function fileSlug(entry: KanjiReferenceEntry): string {
  const sequence = String(entry.sequence).padStart(3, "0");
  return `w${entry.week}-d${entry.day}-${sequence}-${entry.id.replace(`${entry.level}-kanji-`, "")}`;
}
