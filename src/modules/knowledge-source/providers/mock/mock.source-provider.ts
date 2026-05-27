import type { SourceItemDescriptor, SourceProvider } from "../source-provider.interface";

import type { MockSourceConfig } from "./mock.config";

export class MockSourceProvider implements SourceProvider {
  constructor(private readonly config: MockSourceConfig) {}

  async testConnection(): Promise<void> {
    if (this.config.outcome === "failure") {
      throw new Error("Mock connection failed");
    }
  }

  async *listItems(): AsyncIterable<SourceItemDescriptor> {}

  async readItem(_externalId: string): Promise<{
    content: Buffer;
    metadata: Record<string, unknown>;
  }> {
    throw new Error("Mock source provider does not support readItem");
  }
}
