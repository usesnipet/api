import { env } from "@/env";
import { BadRequestException, Injectable } from "@nestjs/common";

import { compileConfigSchemaValidator, createConfigSchemaAjv, formatAjvErrors } from "./config-schema.ajv";
import {
  decryptValue, deriveConfigEncryptionKey, encryptValue, isEncryptedValue
} from "./config-schema.crypto";
import { cloneJson, getAtPath, setAtPath, unsetAtPath } from "./config-schema.paths";
import {
  ConfigSchema,
  ENCRYPTED_FIELD_PLACEHOLDER,
  isEncryptedFieldPlaceholder,
  X_ENCRYPTED_FIELDS,
} from "./config-schema.types";

import type { ConfigValidationResult } from "./config-schema.types";
import type { ErrorObject } from "ajv";

@Injectable()
export class ConfigSchemaService {
  private readonly ajv = createConfigSchemaAjv();
  private readonly encryptionKey = deriveConfigEncryptionKey(env.ENCRYPT_MASTER_PASSWORD);

  validate(schema: ConfigSchema, data: unknown): ConfigValidationResult {
    const validate = compileConfigSchemaValidator(this.ajv, schema);
    const valid = validate(data);
    return {
      valid: valid === true,
      errors: valid ? undefined : formatAjvErrors(validate.errors),
    };
  }

  assertValid(schema: ConfigSchema, data: unknown): void {
    const result = this.validate(schema, data);
    if (result.valid) {
      return;
    }
    throw new BadRequestException({
      message: "Config does not match schema",
      errors: result.errors,
    });
  }

  getEncryptedFieldPaths(schema: ConfigSchema): string[] {
    const paths = schema[X_ENCRYPTED_FIELDS];
    if (!Array.isArray(paths)) {
      return [];
    }
    return paths.filter((path): path is string => typeof path === "string" && path.length > 0);
  }

  encrypt(schema: ConfigSchema, data: Record<string, unknown>): Record<string, unknown> {
    const result = cloneJson(data);
    for (const path of this.getEncryptedFieldPaths(schema)) {
      const value = getAtPath(result, path);
      if (value === undefined || value === null) {
        continue;
      }
      if (typeof value !== "string") {
        throw new BadRequestException(
          `Field "${path}" must be a string to be encrypted`
        );
      }
      if (isEncryptedValue(value)) {
        continue;
      }
      setAtPath(result, path, encryptValue(value, this.encryptionKey));
    }
    return result;
  }

  /**
   * Returns a copy of config with encrypted fields masked (for API responses).
   * Fields with no stored value are omitted so the client can tell they are empty.
   */
  maskEncryptedFieldsForResponse(
    schema: ConfigSchema,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const result = cloneJson(data);
    for (const path of this.getEncryptedFieldPaths(schema)) {
      const value = getAtPath(result, path);
      if (value === undefined || value === null || value === "") {
        unsetAtPath(result, path);
        continue;
      }
      setAtPath(result, path, ENCRYPTED_FIELD_PLACEHOLDER);
    }
    return result;
  }

  decrypt(schema: ConfigSchema, data: Record<string, unknown>): Record<string, unknown> {
    const result = cloneJson(data);
    for (const path of this.getEncryptedFieldPaths(schema)) {
      const value = getAtPath(result, path);
      if (value === undefined || value === null) {
        continue;
      }
      if (typeof value !== "string") {
        throw new BadRequestException(
          `Field "${path}" must be a string to be decrypted`
        );
      }
      if (!isEncryptedValue(value)) {
        continue;
      }
      setAtPath(result, path, decryptValue(value, this.encryptionKey));
    }
    return result;
  }

  /**
   * Validates plain config, then returns a copy with encrypted fields for persistence.
   */
  prepareForStorage(
    schema: ConfigSchema,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertValid(schema, data);
    return this.encrypt(schema, data);
  }

  /**
   * Decrypts stored config. Validation is optional (e.g. after schema migration).
   */
  prepareForUse(
    schema: ConfigSchema,
    data: Record<string, unknown>,
    options?: { validate?: boolean }
  ): Record<string, unknown> {
    const decrypted = this.decrypt(schema, data);
    if (options?.validate) {
      this.assertValid(schema, decrypted);
    }
    return decrypted;
  }

  formatErrors(errors: ErrorObject[] | undefined): string[] {
    return (errors ?? []).map((error) => {
      const path = error.instancePath || "/";
      return `${path} ${error.message ?? "is invalid"}`.trim();
    });
  }

  /**
   * Merges a partial plain config patch into a base config. Encrypted fields omitted,
   * empty, or sent as asterisk placeholders in the patch are kept from base.
   */
  mergePlainConfig(
    schema: ConfigSchema,
    base: Record<string, unknown>,
    patch: Record<string, unknown>
  ): Record<string, unknown> {
    const merged = cloneJson(base);

    for (const [key, value] of Object.entries(patch)) {
      if (
        value !== undefined
        && value !== null
        && value !== ""
        && !isEncryptedFieldPlaceholder(value)
      ) {
        merged[key] = value;
      }
    }

    this.assertValid(schema, merged);
    return merged;
  }
}
