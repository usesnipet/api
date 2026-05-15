import "reflect-metadata";

export const RELATION_FIELDS_METADATA_KEY = "graphql:relationFields";

export type GraphQLModelClass = new (...args: unknown[]) => object;

export type RelationFieldMeta = {
  name: string;
  nestedType?: () => GraphQLModelClass;
};

/** Marks a GraphQL field as a Drizzle relational `with` branch (not a JSON/column field). */
export function Relation(nestedType?: () => GraphQLModelClass): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const ctor = target.constructor as GraphQLModelClass;
    const name = String(propertyKey);
    const list: RelationFieldMeta[] = Reflect.getMetadata(RELATION_FIELDS_METADATA_KEY, ctor) ?? [];
    list.push({ name, nestedType });
    Reflect.defineMetadata(RELATION_FIELDS_METADATA_KEY, list, ctor);
  };
}

export function getRelationFieldsMeta(type: GraphQLModelClass): RelationFieldMeta[] {
  return Reflect.getMetadata(RELATION_FIELDS_METADATA_KEY, type) ?? [];
}

export function isRelationField(type: GraphQLModelClass, fieldName: string): boolean {
  return getRelationFieldsMeta(type).some((m) => m.name === fieldName);
}

export function getRelationNestedType(
  type: GraphQLModelClass,
  fieldName: string,
): GraphQLModelClass | undefined {
  const fn = getRelationFieldsMeta(type).find((m) => m.name === fieldName)?.nestedType;
  return fn?.();
}
