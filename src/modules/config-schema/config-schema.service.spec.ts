import { BadRequestException } from "@nestjs/common";

import { ConfigSchemaService } from "./config-schema.service";
import { isEncryptedValue } from "./config-schema.crypto";
import { X_ENCRYPTED_FIELDS, type ConfigSchema } from "./config-schema.types";

const openAiSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["apiKey"],
  properties: {
    apiKey: { type: "string", minLength: 1 },
    baseUrl: { type: "string", format: "uri" },
  },
  [X_ENCRYPTED_FIELDS]: ["apiKey"],
};

describe("ConfigSchemaService", () => {
  const service = new ConfigSchemaService();

  it("validates config against schema", () => {
    expect(
      service.validate(openAiSchema, { apiKey: "key", baseUrl: "https://api.openai.com" }).valid
    ).toBe(true);
    expect(service.validate(openAiSchema, { baseUrl: "https://api.openai.com" }).valid).toBe(
      false
    );
  });

  it("encrypts and decrypts fields listed in x-encryptedFields", () => {
    const plain = { apiKey: "sk-test", baseUrl: "https://api.openai.com" };
    const stored = service.encrypt(openAiSchema, plain);
    expect(isEncryptedValue(stored.apiKey)).toBe(true);
    expect(stored.baseUrl).toBe(plain.baseUrl);

    const restored = service.decrypt(openAiSchema, stored);
    expect(restored).toEqual(plain);
  });

  it("prepareForStorage validates then encrypts", () => {
    const stored = service.prepareForStorage(openAiSchema, { apiKey: "sk-test" });
    expect(isEncryptedValue(stored.apiKey)).toBe(true);
  });

  it("rejects invalid config on prepareForStorage", () => {
    expect(() => service.prepareForStorage(openAiSchema, {})).toThrow(BadRequestException);
  });

  it("does not double-encrypt already encrypted values", () => {
    const once = service.encrypt(openAiSchema, { apiKey: "sk-test" });
    const twice = service.encrypt(openAiSchema, once);
    expect(twice.apiKey).toBe(once.apiKey);
  });

  it("mergePlainConfig keeps encrypted fields from base when omitted in patch", () => {
    const base = { apiKey: "sk-stored", baseUrl: "https://api.openai.com" };
    const merged = service.mergePlainConfig(openAiSchema, base, { baseUrl: "https://other.example" });
    expect(merged).toEqual({
      apiKey: "sk-stored",
      baseUrl: "https://other.example",
    });
  });

  it("omitEncryptedFields removes encrypted field paths from a copy", () => {
    const stored = service.prepareForStorage(openAiSchema, {
      apiKey: "sk-test",
      baseUrl: "https://api.openai.com",
    });
    const publicConfig = service.omitEncryptedFields(openAiSchema, stored);
    expect(publicConfig).toEqual({ baseUrl: "https://api.openai.com" });
    expect(stored.apiKey).toBeDefined();
  });
});
