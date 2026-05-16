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
  access?: string[]
): string[] | undefined {
  if (!values?.length) return undefined;
  let out = uniqStrings(values);
  if (access?.length) {
    const allow = new Set(access);
    out = out.filter((v) => allow.has(v));
  }
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
  if (!allowed.length) return undefined;

  if (!requested?.length) return allowed;

  const allowSet = new Set(allowed);
  const picked = uniqStrings(requested).filter((f) => allowSet.has(f));
  return picked.length ? picked : undefined;
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
  if (!allowed.length) return undefined;

  if (!requested?.length) return undefined;

  const allowSet = new Set(allowed);
  const picked = uniqStrings(requested).filter((r) => allowSet.has(r));
  return picked.length ? picked : undefined;
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
  where: Record<string, any> | undefined,
  access?: string[]
): Record<string, any> | undefined {
  if (!where || typeof where !== 'object') return undefined;
  let keys = Object.keys(where);
  keys = applyAccessList(keys, access) ?? [];
  if (!keys.length) return undefined;
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = where[k];
  return Object.keys(out).length ? out : undefined;
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

    const whereRaw = extractWhereFromQuery(query);
    const selectRaw = toStringArray(query.select as string | string[] | undefined);
    const orderRaw = extractOrderFromQuery(query);
    const relationsRaw = toStringArray(query.relations as string | string[] | undefined);

    const limit = Math.min(toNumber(query.limit) ?? env.MAX_FIND_LIMIT, env.MAX_FIND_LIMIT);
    const offset = toNumber(query.offset) ?? 0;

    const init: FilterOptionsInit<TEntity> = {
      where: sanitizeWhere(whereRaw, whereAccess) as any,
      select: resolveSelect(selectRaw, config.select, fields.columns) as any,
      relations: resolveRelations(relationsRaw, config.relations, fields.relations) as any,
      order: sanitizeOrder(orderRaw, orderAccess) as any,
      limit,
      offset,
    };
    const filter = new FilterOptions<TEntity>(init);
    return filter;
  }
}

