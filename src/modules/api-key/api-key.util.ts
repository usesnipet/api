import { randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "sk";

export function generateApiKey(): string {
  return `${API_KEY_PREFIX}_${randomBytes(32).toString("base64url")}`;
}