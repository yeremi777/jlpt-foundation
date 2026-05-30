export interface MarkdownTable {
  readonly headers: readonly string[];
  readonly rows: readonly Record<string, string>[];
}

export function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function isTableSeparator(line: string): boolean {
  return /^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line.trim());
}

export function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

export function cleanMarkdownInline(value: string): string {
  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

export function buildRow(headers: readonly string[], cells: readonly string[]): Record<string, string> {
  return headers.reduce<Record<string, string>>((row, header, index) => {
    row[header] = cells[index]?.trim() ?? "";
    return row;
  }, {});
}
