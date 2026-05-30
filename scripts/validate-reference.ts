import { parseKnownLevelReferences } from "./lib/reference-parser.js";
import { validateReferenceData } from "./lib/reference-validator.js";

const data = await parseKnownLevelReferences(["n5", "n4", "n3"]);
const result = validateReferenceData(data);

if (!result.ok) {
  console.error("Reference validation failed");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Reference validation passed");
console.log(JSON.stringify(
  {
    curriculumEntries: data.curriculum.length,
    kanjiEntries: data.kanji.length,
    quizPoolItems: data.quizPool.length,
  },
  null,
  2,
));
