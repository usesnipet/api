import "reflect-metadata";

export const RELATION_FIELDS_METADATA_KEY = "api:relationFields";

export type RelationModelClass = new (...args: unknown[]) => object;

export type RelationFieldMeta = {
  name: string;
  nestedType?: () => RelationModelClass;
};

/** Marks a response field backed by a Drizzle relational `with` branch (not a JSON column). */
export function Relation(nestedType?: () => RelationModelClass): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const ctor = target.constructor as RelationModelClass;
    const name = String(propertyKey);
    const list: RelationFieldMeta[] = Reflect.getMetadata(RELATION_FIELDS_METADATA_KEY, ctor) ?? [];
    list.push({ name, nestedType });
    Reflect.defineMetadata(RELATION_FIELDS_METADATA_KEY, list, ctor);
  };
}

export function getRelationFieldsMeta(type: RelationModelClass): RelationFieldMeta[] {
  return Reflect.getMetadata(RELATION_FIELDS_METADATA_KEY, type) ?? [];
}

/** Dot-paths allowed in `?relations=` for a root model (includes nested `@Relation` targets). */
export function getAllowedRelationPaths(type: RelationModelClass): string[] {
  const paths = new Set<string>();

  const walk = (model: RelationModelClass, prefix?: string, visited = new Set<RelationModelClass>()) => {
    if (visited.has(model)) return;
    visited.add(model);
    for (const { name, nestedType } of getRelationFieldsMeta(model)) {
      const path = prefix ? `${prefix}.${name}` : name;
      paths.add(path);
      const nested = nestedType?.();
      if (nested) walk(nested, path, visited);
    }
  };

  walk(type);
  return [...paths];
}
