import { generateApiKey } from "./api-key.util";

describe("generateApiKey", () => {
  it("generates keys with the sk prefix", () => {
    const key = generateApiKey();

    expect(key).toMatch(/^sk_/);
    expect(key.length).toBeGreaterThan(10);
  });

  it("generates unique keys", () => {
    const first = generateApiKey();
    const second = generateApiKey();

    expect(first).not.toBe(second);
  });
});
