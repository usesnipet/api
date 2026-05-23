import { createHash, randomBytes } from "node:crypto";

const LIVE_PREFIX = "sk_live_";
const TEST_PREFIX = "sk_test_";
const KEY_FORMAT = /^sk_(live|test)_[A-Za-z0-9_-]+$/;

export function getKeyPrefixForEnv(nodeEnv = process.env.NODE_ENV): string {
  return nodeEnv === "production" ? LIVE_PREFIX : TEST_PREFIX;
}

export function isValidKeyFormat(secret: string): boolean {
  return KEY_FORMAT.test(secret);
}

export function hashKey(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function buildKeyPrefix(secret: string): string {
  return secret.slice(0, 16);
}

export function generateApiKeySecret(nodeEnv = process.env.NODE_ENV): string {
  const prefix = getKeyPrefixForEnv(nodeEnv);
  const randomPart = randomBytes(24).toString("base64url");
  return `${prefix}${randomPart}`;
}
