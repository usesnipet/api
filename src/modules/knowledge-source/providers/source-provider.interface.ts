import type { Provider } from "@/common/provider";

export interface SourceItemDescriptor {
  externalId: string;
  hash: string;
  size: number;
  metadata: Record<string, unknown>;
}

export interface SourceProvider extends Provider {
  listItems(options?: { cursor?: string }): AsyncIterable<SourceItemDescriptor>;
  readItem(externalId: string): Promise<{
    content: Buffer;
    metadata: Record<string, unknown>;
  }>;
}
