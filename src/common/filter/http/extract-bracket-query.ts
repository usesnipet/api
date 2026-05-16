import qs from "qs";

function buildFlatBracketQueryParts(
  query: Record<string, unknown>,
  paramName: string,
): string[] {
  const prefix = `${paramName}[`;
  const parts: string[] = [];

  for (const key of Object.keys(query)) {
    if (!key.startsWith(prefix)) continue;
    const raw = query[key];
    if (Array.isArray(raw)) {
      for (const v of raw) {
        parts.push(`${key}=${encodeURIComponent(String(v))}`);
      }
      continue;
    }
    if (raw !== undefined && raw !== null) {
      parts.push(`${key}=${encodeURIComponent(String(raw))}`);
    }
  }

  return parts;
}

/** Reads nested `query[param]` or flat `param[field]...` keys. */
export function extractBracketQuery<T>(
  query: Record<string, unknown>,
  paramName: string,
  parse: (value: unknown) => T | undefined,
): T | undefined {
  const nested = query[paramName];
  if (nested !== undefined) {
    const parsed = parse(nested);
    if (parsed !== undefined) return parsed;
  }

  const parts = buildFlatBracketQueryParts(query, paramName);
  if (!parts.length) return undefined;

  const root = qs.parse(parts.join("&")) as Record<string, unknown>;
  return parse(root[paramName]);
}
