import qs from "qs";

import { FilterOrderDirection } from "../filter-options";

export type ParsedOrderItem = {
  field: string;
  direction?: FilterOrderDirection;
};

const ORDER_DIRECTIONS = new Set<string>(["asc", "desc"]);

function normalizeDirection(value: unknown): FilterOrderDirection | undefined {
  const s = String(value ?? "").trim().toLowerCase();
  if (ORDER_DIRECTIONS.has(s)) return s as FilterOrderDirection;
  return undefined;
}

function normalizeFieldOrder(
  field: string,
  raw: unknown,
): ParsedOrderItem | undefined {
  if (raw === undefined || raw === null) return undefined;

  if (typeof raw === "string") {
    return { field, direction: normalizeDirection(raw) };
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if ("direction" in obj) {
      return { field, direction: normalizeDirection(obj.direction) };
    }
    for (const dir of ["asc", "desc"] as const) {
      if (dir in obj) return { field, direction: dir };
    }
  }

  return undefined;
}

/**
 * Parses `order` from bracket notation.
 *
 * @example
 * `{ name: "asc", createdAt: "desc" }`  // ?order[name]=asc&order[createdAt]=desc
 * `{ name: { direction: "asc" } }`      // ?order[name][direction]=asc
 */
export function parseOrderQuery(value: unknown): ParsedOrderItem[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) return undefined;

  const items: ParsedOrderItem[] = [];
  for (const [field, raw] of Object.entries(value as Record<string, unknown>)) {
    const item = normalizeFieldOrder(field, raw);
    if (item) items.push(item);
  }

  return items.length ? items : undefined;
}

/**
 * Reads `order` from the full request query.
 * Supports nested `query.order` (extended parser) and flat `order[field]` keys.
 */
export function extractOrderFromQuery(
  query: Record<string, unknown>,
): ParsedOrderItem[] | undefined {
  const nested = query.order;
  if (nested !== undefined) {
    const parsed = parseOrderQuery(nested);
    if (parsed?.length) return parsed;
  }

  const flatKeys = Object.keys(query).filter((k) => k.startsWith("order["));
  if (!flatKeys.length) return undefined;

  const parts: string[] = [];
  for (const key of flatKeys) {
    const raw = query[key];
    if (Array.isArray(raw)) {
      for (const v of raw) {
        parts.push(`${key}=${encodeURIComponent(String(v))}`);
      }
    } else if (raw !== undefined && raw !== null) {
      parts.push(`${key}=${encodeURIComponent(String(raw))}`);
    }
  }

  if (!parts.length) return undefined;

  const parsed = qs.parse(parts.join("&")) as { order?: unknown };
  return parseOrderQuery(parsed.order);
}
