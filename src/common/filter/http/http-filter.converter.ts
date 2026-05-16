import { env } from "@/env";
import { Constructable } from "@/types";

import { FilterOptions, FilterOptionsInit } from "../filter-options";
import { getEntityFields } from "../get-entity-fields";

import { extractOrderFromQuery } from "./parse-order-query";
import { extractWhereFromQuery } from "./parse-where-query";

export type FilterHttpConfig = {
  select?: string[];
  where?: string[];
  order?: string[];
  relations?: string[];
  maxLimit?: number;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function uniqStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function applyAccessList(
  values: string[] | undefined,
  access?: string[],
): string[] | undefined {
  if (!values?.length) return undefined;
  const out = access?.length
    ? uniqStrings(values).filter((v) => access.includes(v))
    : uniqStrings(values);
  return out.length ? out : undefined;
}

function intersectWithEntityFields(
  fields: string[],
  entityFields: string[],
): string[] {
  const allowed = uniqStrings(fields);
  if (!entityFields.length) return allowed;
  const entity = new Set(entityFields);
  return allowed.filter((f) => entity.has(f));
}

function pickFromAllowList(
  requested: string[] | undefined,
  allowed: string[],
  whenEmptyRequest: string[] | undefined,
): string[] | undefined {
  if (!allowed.length) return undefined;
  if (!requested?.length) return whenEmptyRequest;
  const allowSet = new Set(allowed);
  const picked = uniqStrings(requested).filter((v) => allowSet.has(v));
  return picked.length ? picked : undefined;
}

/** Config `select` is the default projection; query can only narrow it. */
function resolveSelect(
  requested: string[] | undefined,
  configured: string[] | undefined,
  entityColumns: string[],
): string[] | undefined {
  if (!configured?.length) {
    return applyAccessList(requested, entityColumns.length ? entityColumns : undefined);
  }

  const allowed = intersectWithEntityFields(configured, entityColumns);
  return pickFromAllowList(requested, allowed, allowed);
}

function toStringArray(value?: string | string[]): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [String(value)].filter(Boolean);
}

/**
 * Relations are opt-in via config. No config entry means none load.
 * Query only narrows the configured allow list.
 */
function resolveRelations(
  requested: string[] | undefined,
  configured: string[] | undefined,
  entityRelations: string[],
): string[] | undefined {
  if (!configured?.length) return undefined;
  const allowed = intersectWithEntityFields(configured, entityRelations);
  return pickFromAllowList(requested, allowed, undefined);
}

/** Entity columns intersected with optional config allow list. */
function mergeFieldAccess(
  configured: string[] | undefined,
  entityFields: string[],
): string[] | undefined {
  if (!entityFields.length) {
    return configured?.length ? uniqStrings(configured) : undefined;
  }
  if (!configured?.length) return [...new Set(entityFields)];
  const out = intersectWithEntityFields(configured, entityFields);
  return out.length ? out : undefined;
}

function sanitizeOrder(
  order: Array<{ field: string; direction?: "asc" | "desc" }> | undefined,
  access?: string[],
): Array<{ field: string; direction?: "asc" | "desc" }> | undefined {
  if (!order?.length) return undefined;
  const allowed = access?.length ? new Set(access) : undefined;
  const out = order.filter((o) => o?.field && (!allowed || allowed.has(o.field)));
  return out.length ? out : undefined;
}

function sanitizeWhere(
  where: Record<string, unknown> | undefined,
  access?: string[],
): Record<string, unknown> | undefined {
  if (!where || typeof where !== 'object') return undefined;
  const keys = applyAccessList(Object.keys(where), access);
  if (!keys?.length) return undefined;
  return Object.fromEntries(keys.map((k) => [k, where[k]]));
}

export class HttpFilterConverter {
  static fromQuery<TEntity extends object = any>(
    cls: Constructable<TEntity>,
    query: Record<string, unknown>,
    config: FilterHttpConfig = {}
  ): FilterOptions<TEntity> {
    const fields = getEntityFields(cls);
    const whereAccess = mergeFieldAccess(config.where, fields.columns);
    const orderAccess = mergeFieldAccess(config.order, fields.columns);

    const maxLimit = Math.min(config.maxLimit ?? env.MAX_FIND_LIMIT, env.MAX_FIND_LIMIT);

    const init: FilterOptionsInit<TEntity> = {
      where: sanitizeWhere(extractWhereFromQuery(query), whereAccess) as any,
      select: resolveSelect(
        toStringArray(query.select as string | string[] | undefined),
        config.select,
        fields.columns,
      ) as any,
      relations: resolveRelations(
        toStringArray(query.relations as string | string[] | undefined),
        config.relations,
        fields.relations,
      ) as any,
      order: sanitizeOrder(extractOrderFromQuery(query), orderAccess) as any,
      limit: Math.min(toNumber(query.limit) ?? maxLimit, maxLimit),
      offset: toNumber(query.offset) ?? 0,
    };

    return new FilterOptions<TEntity>(init);
  }
}
