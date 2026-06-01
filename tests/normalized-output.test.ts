import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RawLearningItem } from "../scripts/lib/raw-types.js";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);

describe("normalized raw item output", () => {
  it("writes per-level raw-items files", async () => {
    const n5 = await readJson<RawLearningItem[]>("public/data/normalized/n5/raw-items.json");
    const n4 = await readJson<RawLearningItem[]>("public/data/normalized/n4/raw-items.json");
    const n3 = await readJson<RawLearningItem[]>("public/data/normalized/n3/raw-items.json");

    expect(n5).toHaveLength(108);
    expect(n4).toHaveLength(198);
    expect(n3).toHaveLength(336);

    expect(n5.every((item) => item.level === "n5")).toBe(true);
    expect(n4.every((item) => item.level === "n4")).toBe(true);
    expect(n3.every((item) => item.level === "n3")).toBe(true);
  });
});

async function readJson<T>(relativePath: string): Promise<T> {
  const text = await readFile(path.join(rootDir, relativePath), "utf8");
  return JSON.parse(text) as T;
}
