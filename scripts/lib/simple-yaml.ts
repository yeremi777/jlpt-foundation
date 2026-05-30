type Scalar = string | number | boolean | null;

export type YamlValue = Scalar | YamlObject | YamlValue[];

export interface YamlObject {
  readonly [key: string]: YamlValue;
}

interface ContainerFrame {
  readonly indent: number;
  readonly value: Record<string, YamlValue> | YamlValue[];
}

export function parseSimpleYaml(input: string): YamlObject {
  const root: Record<string, YamlValue> = {};
  const stack: ContainerFrame[] = [{ indent: -1, value: root }];
  const lines = input.split(/\r?\n/);

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) {
      continue;
    }

    const indent = rawLine.match(/^ */u)?.[0].length ?? 0;
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1]!.indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]!.value;

    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) {
        throw new Error(`YAML list item has non-list parent: ${rawLine}`);
      }
      parent.push(parseScalar(line.slice(2).trim()));
      continue;
    }

    const keyMatch = line.match(/^([^:]+):(.*)$/u);
    if (!keyMatch) {
      throw new Error(`Unsupported YAML line: ${rawLine}`);
    }

    if (Array.isArray(parent)) {
      throw new Error(`YAML mapping has list parent: ${rawLine}`);
    }

    const key = keyMatch[1]!.trim();
    const rawValue = keyMatch[2]!.trim();

    if (rawValue) {
      parent[key] = parseScalar(rawValue);
      continue;
    }

    const nextMeaningfulLine = lines.slice(lines.indexOf(rawLine) + 1).find((nextLine) => nextLine.trim());
    const child: Record<string, YamlValue> | YamlValue[] = nextMeaningfulLine?.trim().startsWith("- ") ? [] : {};
    parent[key] = child;
    stack.push({ indent, value: child });
  }

  return root;
}

function parseScalar(value: string): YamlValue {
  if (value === "[]") {
    return [];
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => parseScalar(item));
  }
  if (value === "null") {
    return null;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (/^-?\d+$/u.test(value)) {
    return Number(value);
  }
  return value.replace(/^["']|["']$/gu, "");
}
