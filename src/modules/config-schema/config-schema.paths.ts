export function getAtPath(root: unknown, path: string): unknown {
  if (!path) {
    return root;
  }

  let current: unknown = root;
  for (const segment of path.split(".")) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export function setAtPath(
  root: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const segments = path.split(".");
  let current: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const next = current[segment];
    if (next === null || next === undefined || typeof next !== "object" || Array.isArray(next)) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;
}

export function unsetAtPath(root: Record<string, unknown>, path: string): void {
  const segments = path.split(".");
  let current: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const next = current[segment];
    if (next === null || next === undefined || typeof next !== "object" || Array.isArray(next)) {
      return;
    }
    current = next as Record<string, unknown>;
  }

  delete current[segments[segments.length - 1]];
}

export function cloneJson<T>(value: T): T {
  return structuredClone(value);
}
