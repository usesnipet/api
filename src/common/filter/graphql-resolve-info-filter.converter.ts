import type { FieldNode, GraphQLResolveInfo, SelectionSetNode } from "graphql";

import { isRelationField, getRelationNestedType, type GraphQLModelClass } from "@/common/graphql/relation.decorator";

import {
  FilterCondition, FilterOptionsInit, FilterPrimitive, FilterWhere, FilterWhereOp
} from "./filter-options";
import { GraphQLFilterArgsType } from "./graphql-filter-args";

function walkSelections(
  selectionSet: SelectionSetNode | undefined,
  fragments: GraphQLResolveInfo["fragments"],
  onField: (field: FieldNode) => void,
): void {
  if (!selectionSet) return;
  for (const sel of selectionSet.selections) {
    if (sel.kind === "Field") {
      onField(sel);
    } else if (sel.kind === "FragmentSpread") {
      const frag = fragments[sel.name.value];
      if (frag) walkSelections(frag.selectionSet, fragments, onField);
    } else if (sel.kind === "InlineFragment") {
      walkSelections(sel.selectionSet, fragments, onField);
    }
  }
}

function uniqStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function toFilterCondition(where: Record<string, any>): Record<string, FilterCondition> {
  const result: Record<string, FilterCondition> = {};
  if (!where) return result;
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (typeof value === 'object') {
      Object.entries(value).forEach(([op, v]) => {
        result[key] = { op: op as FilterWhereOp, value: v as FilterPrimitive };
      });
    } else {
      result[key] = { op: 'eq', value };
    }
  }
  return result;
}

function collectFromSelections(
  selectionSet: SelectionSetNode | undefined,
  fragments: GraphQLResolveInfo["fragments"],
  modelType: GraphQLModelClass,
  pathPrefix: string | undefined,
  scalars: string[],
  relations: string[],
): void {
  walkSelections(selectionSet, fragments, (field) => {
    const name = field.name.value;
    if (name === "__typename") return;

    const atRoot = pathPrefix === undefined;

    if (!field.selectionSet) {
      if (atRoot) scalars.push(name);
      return;
    }

    if (!isRelationField(modelType, name)) {
      if (atRoot) scalars.push(name);
      return;
    }

    const path = pathPrefix ? `${pathPrefix}.${name}` : name;
    relations.push(path);

    const nestedType = getRelationNestedType(modelType, name);
    if (nestedType) {
      collectFromSelections(field.selectionSet, fragments, nestedType, path, scalars, relations);
    }
  });
}

export class GraphQLFilterConverter {
  static toFilterOptions<Model extends object = any>(
    model: GraphQLModelClass,
    info: GraphQLResolveInfo,
    args: GraphQLFilterArgsType,
  ): FilterOptionsInit<Model> {
    const scalars: string[] = [];
    const relations: string[] = [];

    const root = info.fieldNodes[0];
    if (!root?.selectionSet) {
      return {};
    }

    collectFromSelections(root.selectionSet, info.fragments, model, undefined, scalars, relations);

    const init: FilterOptionsInit<Model> = {
      where: toFilterCondition(args.where as Record<string, any>) as FilterWhere<Model>,
      take: args.take,
      skip: args.skip,
    };
    const sel = uniqStrings(scalars);
    if (sel.length) init.select = sel as FilterOptionsInit<Model>["select"];
    const rel = uniqStrings(relations);
    if (rel.length) init.relations = rel as FilterOptionsInit<Model>["relations"];

    return init;
  }
}
