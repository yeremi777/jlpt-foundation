import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { RawLearningItem } from "./lib/raw-types.js";
import { parseRawDataset } from "./lib/raw-parser.js";
import { JlptLevel } from "./lib/reference-types.js";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const outputDir = path.join(rootDir, "public/data/normalized");

const { items } = await parseRawDataset();

await mkdir(outputDir, { recursive: true });

const itemsByLevel = groupItemsByLevel(items);
const levelOutputPaths: Record<string, string> = {};

for (const [level, levelItems] of Object.entries(itemsByLevel)) {
  const levelOutputDir = path.join(outputDir, level);
  const levelOutputPath = path.join(levelOutputDir, "raw-items.json");

  await mkdir(levelOutputDir, { recursive: true });
  await writeJson(levelOutputPath, levelItems);
  levelOutputPaths[level] = levelOutputPath;
}

const counts = items.reduce<Record<string, number>>((acc, item) => {
  const key = `${item.level}/${item.type}`;
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

console.log(`Parsed ${items.length} raw markdown items`);
console.log(JSON.stringify({ counts, levelOutputPaths }, null, 2));

function groupItemsByLevel(items: readonly RawLearningItem[]): Partial<Record<JlptLevel, RawLearningItem[]>> {
  return items.reduce<Partial<Record<JlptLevel, RawLearningItem[]>>>((acc, item) => {
    acc[item.level] ??= [];
    acc[item.level]?.push(item);
    return acc;
  }, {});
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
