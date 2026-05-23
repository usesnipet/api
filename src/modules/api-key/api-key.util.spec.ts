import {
  buildKeyPrefix,
  generateApiKeySecret,
  getKeyPrefixForEnv,
  hashKey,
  isValidKeyFormat,
} from "./api-key.util";

describe("api-key.util", () => {
  it("generates secrets with the expected prefix and format", () => {
    const secret = generateApiKeySecret();
    expect(secret.startsWith(getKeyPrefixForEnv())).toBe(true);
    expect(isValidKeyFormat(secret)).toBe(true);
  });

  it("hashes deterministically", () => {
    const secret = "sk_test_abc123";
    expect(hashKey(secret)).toHaveLength(64);
    expect(hashKey(secret)).toBe(hashKey(secret));
  });

  it("builds a public prefix from the secret", () => {
    const secret = "sk_live_abcdefghijklmnop";
    expect(buildKeyPrefix(secret)).toBe("sk_live_abcdefgh");
  });
});
