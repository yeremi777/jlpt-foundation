import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseLevelReferences } from "./lib/reference-parser.js";
import { validateReferenceData } from "./lib/reference-validator.js";
import { JlptLevel } from "./lib/reference-types.js";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const levels: readonly JlptLevel[] = ["n5", "n4", "n3"];

const generated: Record<string, { curriculumEntries: number; kanjiEntries: number; quizPoolItems: number }> = {};

for (const level of levels) {
  const outputDir = path.join(rootDir, `public/data/normalized/${level}`);
  const data = await parseLevelReferences(level);
  const validation = validateReferenceData(data);

  if (!validation.ok) {
    console.error(`Cannot generate normalized ${level.toUpperCase()} data because validation failed`);
    for (const error of validation.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  await writeJson(path.join(outputDir, "curriculum.json"), data.curriculum);
  await writeJson(path.join(outputDir, "kanji.json"), data.kanji);
  await writeJson(path.join(outputDir, "quiz-pool.json"), data.quizPool);

  generated[level] = {
    curriculumEntries: data.curriculum.length,
    kanjiEntries: data.kanji.length,
    quizPoolItems: data.quizPool.length,
  };
}

console.log("Generated normalized reference data");
console.log(JSON.stringify(
  generated,
  null,
  2,
));

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
