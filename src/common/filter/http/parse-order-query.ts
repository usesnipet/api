import { FilterOrderDirection } from "../filter-options";

import { extractBracketQuery } from "./extract-bracket-query";

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
    const dir = (["asc", "desc"] as const).find((d) => d in obj);
    if (dir) return { field, direction: dir };
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
  return extractBracketQuery(query, "order", parseOrderQuery);
}
