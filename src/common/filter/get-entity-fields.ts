import { Constructable } from "@/types";
import { defaultMetadataStorage } from "class-transformer/cjs/storage";
import { getMetadataStorage } from "class-validator";

type EntityModel = Constructable<unknown> & {
  fromRow?: (...args: unknown[]) => unknown;
};

export type EntityFields = {
  /** Scalar / JSON column fields (where, select, order). */
  columns: string[];
  /** Dotted relation paths `with` (e.g. `packageTags`, `packageTags.tag`). */
  relations: string[];
};

function getValidatedPropertyNames(cls: Constructable<unknown>): string[] {
  const metadatas = getMetadataStorage().getTargetValidationMetadatas(
    cls,
    "",
    false,
    false,
  );
  return [...new Set(metadatas.map((m) => m.propertyName))];
}

function resolveNestedEntityType(
  cls: Constructable<unknown>,
  propertyName: string,
): Constructable<unknown> | undefined {
  const typeMeta = defaultMetadataStorage.findTypeMetadata(cls, propertyName);
  if (!typeMeta) return undefined;

  let nested: unknown;
  try {
    nested = typeMeta.typeFunction();
  } catch {
    return undefined;
  }

  if (!isEntityClass(nested)) return undefined;
  return nested;
}

function isEntityClass(type: unknown): type is EntityModel {
  return typeof type === "function" && typeof (type as EntityModel).fromRow === "function";
}

function collectRelationPaths(
  cls: Constructable<unknown>,
  prefix = "",
  visited = new Set<Constructable<unknown>>(),
): string[] {
  if (visited.has(cls)) return [];
  visited.add(cls);

  const paths: string[] = [];

  for (const name of getValidatedPropertyNames(cls)) {
    const nested = resolveNestedEntityType(cls, name);
    if (!nested) continue;

    const path = prefix ? `${prefix}.${name}` : name;
    paths.push(path);
    paths.push(...collectRelationPaths(nested, path, visited));
  }

  return paths;
}

/**
 * Introspects a Nest model class and returns filterable column and relation paths.
 * Relations are properties with `@Type(() => Entity)` where `Entity` defines `fromRow`.
 */
export function getEntityFields<T extends object>(
  cls: Constructable<T>,
): EntityFields {
  const propertyNames = getValidatedPropertyNames(cls);
  const columns: string[] = [];

  for (const name of propertyNames) {
    if (!resolveNestedEntityType(cls, name)) {
      columns.push(name);
    }
  }

  return {
    columns,
    relations: collectRelationPaths(cls),
  };
}
