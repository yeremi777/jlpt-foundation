import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = path.resolve(new URL("../../..", import.meta.url).pathname);

export async function readJson<T>(relativePath: string): Promise<T> {
  const text = await readFile(path.join(ROOT_DIR, relativePath), "utf8");
  return JSON.parse(text) as T;
}
