import type { ErrorObject, ValidateFunction } from "ajv";

export const X_ENCRYPTED_FIELDS = "x-encryptedFields" as const;

export type ConfigSchema = Record<string, unknown> & {
  [X_ENCRYPTED_FIELDS]?: string[];
};

export interface ConfigValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

export type ConfigSchemaValidator = ValidateFunction;
