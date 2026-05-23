import { env } from "@/env";
import { BadRequestException, Injectable } from "@nestjs/common";
import type { ErrorObject } from "ajv";

import {
  compileConfigSchemaValidator,
  createConfigSchemaAjv,
  formatAjvErrors,
} from "./config-schema.ajv";
import {
  decryptValue,
  deriveConfigEncryptionKey,
  encryptValue,
  isEncryptedValue,
} from "./config-schema.crypto";
import { cloneJson, getAtPath, setAtPath, unsetAtPath } from "./config-schema.paths";
import {
  X_ENCRYPTED_FIELDS,
  type ConfigSchema,
  type ConfigValidationResult,
} from "./config-schema.types";

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
   * Returns a copy of config without fields listed in x-encryptedFields (for API responses).
   */
  omitEncryptedFields(
    schema: ConfigSchema,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const result = cloneJson(data);
    for (const path of this.getEncryptedFieldPaths(schema)) {
      unsetAtPath(result, path);
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
}
