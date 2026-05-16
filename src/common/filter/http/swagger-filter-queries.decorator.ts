import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

/** OpenAPI parameters matching `HttpFilterConverter.fromQuery`. */
export function ApiFilterQueries() {
  return applyDecorators(
    ApiQuery({
      name: "where",
      required: false,
      description:
        "JSON object: each key is an entity field; value is a primitive or `{ \"op\": \"eq\"|\"ne\"|\"gt\"|\"gte\"|\"lt\"|\"lte\"|\"like\"|\"ilike\"|\"in\"|\"contains\", \"value\": ... }`. Must be URL-encoded when sent as a single query string.",
      schema: {
        type: "string",
      },
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
      name: "order",
      required: false,
      description:
        "Comma-separated `field:asc|desc`.",
      schema: { type: "array", items: { type: "string" } },
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
