import {
  decryptValue,
  deriveConfigEncryptionKey,
  encryptValue,
  isEncryptedValue,
} from "./config-schema.crypto";

describe("config-schema.crypto", () => {
  const key = deriveConfigEncryptionKey("test-master-password");

  it("encrypts and decrypts round-trip", () => {
    const plain = "sk-secret-api-key";
    const encrypted = encryptValue(plain, key);
    expect(isEncryptedValue(encrypted)).toBe(true);
    expect(decryptValue(encrypted, key)).toBe(plain);
  });

  it("fails decryption with wrong key", () => {
    const encrypted = encryptValue("secret", key);
    const otherKey = deriveConfigEncryptionKey("other-password");
    expect(() => decryptValue(encrypted, otherKey)).toThrow();
  });
});
