import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

/** OpenAPI parameters matching `HttpFilterConverter.fromQuery`. */
export function ApiFilterQueries() {
  return applyDecorators(
    ApiQuery({
      name: "where[field]",
      required: false,
      description:
        "Filter by field. Shorthand: `where[name]=my-name` (equals). With operator: `where[name][eq]=my-name`, `where[name][contains]=ame`, `where[name][in]=a&where[name][in]=b`. Ops: eq, ne, gt, gte, lt, lte, like, ilike, in, contains.",
      schema: { type: "string" },
    }),
    ApiQuery({
      name: "select",
      required: false,
      description: "Comma-separated field names",
      schema: { type: "array", items: { type: "string" } },
    }),
    ApiQuery({
      name: "relations",
      required: false,
      description: "Comma-separated relation paths (e.g. `myRelation`, `myRelation.myNestedRelation`).",
      schema: { type: "array", items: { type: "string" } },
    }),
    ApiQuery({
      name: "order[field]",
      required: false,
      description:
        "Sort by field. Shorthand: `order[name]=asc`. Explicit: `order[name][direction]=desc`. Multiple: `order[name]=asc&order[createdAt]=desc`.",
      schema: { type: "string" },
    }),
    ApiQuery({
      name: "limit",
      required: false,
      description: "Maximum number of rows",
      schema: { type: "integer", minimum: 1, example: 200 },
    }),
    ApiQuery({
      name: "offset",
      required: false,
      description: "Number of rows to skip",
      schema: { type: "integer", minimum: 0, example: 0 },
    }),
  );
}
