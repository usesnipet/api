import type { IndexProvider } from "../index-provider.interface";

import type { MockIndexConfig } from "./mock.config";

export class MockIndexProvider implements IndexProvider {
  constructor(private readonly config: MockIndexConfig) {}

  async testConnection(): Promise<void> {
    if (this.config.outcome === "failure") {
      throw new Error("Mock connection failed");
    }
  }
}
