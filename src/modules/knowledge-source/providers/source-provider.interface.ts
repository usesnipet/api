export interface SourceItemDescriptor {
  externalId: string;
  hash: string;
  size: number;
  metadata: Record<string, unknown>;
}

export interface SourceProvider {
  testConnection(): Promise<void>;
  listItems(options?: { cursor?: string }): AsyncIterable<SourceItemDescriptor>;
  readItem(externalId: string): Promise<{
    content: Buffer;
    metadata: Record<string, unknown>;
  }>;
}
