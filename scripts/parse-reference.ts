import { parseKnownLevelReferences } from "./lib/reference-parser.js";

const data = await parseKnownLevelReferences(["n5", "n4", "n3"]);

const curriculumBySection = data.curriculum.reduce<Record<string, number>>((counts, entry) => {
  counts[entry.section] = (counts[entry.section] ?? 0) + 1;
  return counts;
}, {});

console.log("Parsed known level references");
console.log(JSON.stringify(
  {
    curriculumEntries: data.curriculum.length,
    curriculumBySection,
    kanjiEntries: data.kanji.length,
    quizPoolItems: data.quizPool.length,
  },
  null,
  2,
));
