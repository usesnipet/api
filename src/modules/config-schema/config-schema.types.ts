import type { ErrorObject, ValidateFunction } from "ajv";

export const X_ENCRYPTED_FIELDS = "x-encryptedFields" as const;

/** Mask returned in API responses when an encrypted field has a stored value. */
export const ENCRYPTED_FIELD_PLACEHOLDER = "********";

export function isEncryptedFieldPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.length > 0 && /^[*]+$/.test(value);
}

export type ConfigSchema = Record<string, unknown> & {
  [X_ENCRYPTED_FIELDS]?: string[];
};

export interface ConfigValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

export type ConfigSchemaValidator = ValidateFunction;
