import {
  FilterCondition,
  FilterPrimitive,
  FilterWhereOp,
} from "../filter-options";

import { extractBracketQuery } from "./extract-bracket-query";

const WHERE_OPS: FilterWhereOp[] = [
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
  "contains",
];

const WHERE_OP_SET = new Set<string>(WHERE_OPS);

function parseJsonIfPossible(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function coerceScalar(value: unknown): FilterPrimitive {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const s = String(value).trim();
  if (s === "null") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function coerceFilterValue(
  value: unknown,
): FilterPrimitive | FilterPrimitive[] {
  if (Array.isArray(value)) {
    return value.map((v) => coerceScalar(v));
  }
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((part) => coerceScalar(part.trim()));
  }
  return coerceScalar(value);
}

function normalizeLegacyOpObject(
  raw: Record<string, unknown>,
): FilterCondition | undefined {
  const op = String(raw.op ?? "");
  if (!WHERE_OP_SET.has(op)) return undefined;
  return {
    op: op as FilterWhereOp,
    value: coerceFilterValue(raw.value) as FilterPrimitive | FilterPrimitive[],
  };
}

function normalizeBracketOps(
  raw: Record<string, unknown>,
): FilterCondition | undefined {
  const op = WHERE_OPS.find((name) => name in raw && raw[name] !== undefined);
  if (!op) return undefined;
  return { op, value: coerceFilterValue(raw[op]) };
}

export function normalizeFieldCondition(raw: unknown): FilterCondition | undefined {
  if (raw === undefined || raw === null) return undefined;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if ("op" in obj && "value" in obj) {
      return normalizeLegacyOpObject(obj);
    }
    return normalizeBracketOps(obj);
  }

  return coerceScalar(raw);
}

/**
 * Parses `where` from query string bracket notation or legacy JSON.
 *
 * @example
 * `{ where: { name: { eq: "mayron" } } }`  // ?where[name][eq]=mayron
 * `{ where: { name: "mayron" } }`           // ?where[name]=mayron
 * `{ where: { name: { in: ["a", "b"] } } }` // ?where[name][in]=a&where[name][in]=b
 */
export function parseWhereQuery(
  value: unknown,
): Record<string, FilterCondition> | undefined {
  if (value === undefined || value === null) return undefined;

  let parsed: unknown = value;
  if (typeof value === "string") {
    parsed = parseJsonIfPossible(value);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }

  const out: Record<string, FilterCondition> = {};

  for (const [field, raw] of Object.entries(parsed as Record<string, unknown>)) {
    const condition = normalizeFieldCondition(raw);
    if (condition !== undefined) {
      out[field] = condition;
    }
  }

  return Object.keys(out).length ? out : undefined;
}

/**
 * Reads `where` from the full request query.
 * Supports nested `query.where` (extended parser) and flat `where[field][op]` keys.
 */
export function extractWhereFromQuery(
  query: Record<string, unknown>,
): Record<string, FilterCondition> | undefined {
  return extractBracketQuery(query, "where", parseWhereQuery);
}
