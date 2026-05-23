import Ajv, { ErrorObject, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

import { X_ENCRYPTED_FIELDS } from "./config-schema.types";

let sharedAjv: Ajv | undefined;

export function createConfigSchemaAjv(): Ajv {
  if (sharedAjv) {
    return sharedAjv;
  }

  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: false,
    strict: false,
  });
  addFormats(ajv);
  ajv.addKeyword({
    keyword: X_ENCRYPTED_FIELDS,
    schemaType: "array",
    metaSchema: {
      type: "array",
      items: { type: "string" },
    },
  });
  sharedAjv = ajv;
  return ajv;
}

export function compileConfigSchemaValidator(
  ajv: Ajv,
  schema: Record<string, unknown>
): ValidateFunction {
  return ajv.compile(schema);
}

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): ErrorObject[] {
  return errors ?? [];
}
