import { ConflictException } from "@nestjs/common";

import { assertProviderAndConfigMutable } from "./knowledge-source-update.policy";

describe("assertProviderAndConfigMutable", () => {
  it("allows provider and config when there are no source items", () => {
    expect(() =>
      assertProviderAndConfigMutable(false, {
        provider: "s3",
        config: { bucket: "x", region: "us-east-1" },
      })
    ).not.toThrow();
  });

  it("allows name-only changes when source items exist", () => {
    expect(() => assertProviderAndConfigMutable(true, {})).not.toThrow();
  });

  it("rejects provider change after first sync", () => {
    expect(() => assertProviderAndConfigMutable(true, { provider: "notion" })).toThrow(
      ConflictException
    );
  });

  it("rejects config change after first sync", () => {
    expect(() =>
      assertProviderAndConfigMutable(true, { config: { bucket: "other" } })
    ).toThrow(ConflictException);
  });
});
