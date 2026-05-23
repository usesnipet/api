import { getAtPath, setAtPath } from "./config-schema.paths";

describe("config-schema.paths", () => {
  it("reads and writes nested paths", () => {
    const root: Record<string, unknown> = {
      credentials: { apiKey: "plain" },
    };
    expect(getAtPath(root, "credentials.apiKey")).toBe("plain");
    setAtPath(root, "credentials.apiKey", "encrypted");
    expect(getAtPath(root, "credentials.apiKey")).toBe("encrypted");
  });
});
