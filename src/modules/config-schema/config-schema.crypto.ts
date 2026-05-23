import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SCRYPT_SALT = "snipet-config-schema-v1";
export const ENCRYPTED_VALUE_PREFIX = "$enc$v1$";

export function deriveConfigEncryptionKey(masterPassword: string): Buffer {
  return scryptSync(masterPassword, SCRYPT_SALT, KEY_LENGTH);
}

export function isEncryptedValue(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(ENCRYPTED_VALUE_PREFIX);
}

export function encryptValue(plainText: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]);
  return `${ENCRYPTED_VALUE_PREFIX}${payload.toString("base64url")}`;
}

export function decryptValue(cipherText: string, key: Buffer): string {
  if (!cipherText.startsWith(ENCRYPTED_VALUE_PREFIX)) {
    throw new Error("Value is not an encrypted config field");
  }

  const payload = Buffer.from(
    cipherText.slice(ENCRYPTED_VALUE_PREFIX.length),
    "base64url"
  );
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
