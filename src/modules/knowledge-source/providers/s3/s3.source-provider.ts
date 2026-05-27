import { GetObjectCommand, HeadBucketCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

import type { SourceItemDescriptor, SourceProvider } from "../source-provider.interface";

import type { S3SourceConfig } from "./s3.config";

export class S3SourceProvider implements SourceProvider {
  private readonly client: S3Client;
  private readonly prefix: string;

  constructor(private readonly config: S3SourceConfig) {
    this.prefix = config.prefix?.replace(/\/$/, "") ?? "";
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? Boolean(config.endpoint),
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            }
          : undefined,
    });
  }

  async testConnection(): Promise<void> {
    await this.client.send(
      new HeadBucketCommand({
        Bucket: this.config.bucket,
      })
    );
  }

  async *listItems(options?: { cursor?: string }): AsyncIterable<SourceItemDescriptor> {
    let continuationToken = options?.cursor;

    do {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.config.bucket,
          Prefix: this.prefix ? `${this.prefix}/` : undefined,
          ContinuationToken: continuationToken,
        })
      );

      for (const object of response.Contents ?? []) {
        if (!object.Key || object.Key.endsWith("/")) {
          continue;
        }

        const externalId = this.toExternalId(object.Key);
        yield {
          externalId,
          hash: object.ETag?.replace(/"/g, "") ?? externalId,
          size: object.Size ?? 0,
          metadata: {
            key: object.Key,
            lastModified: object.LastModified?.toISOString(),
          },
        };
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);
  }

  async readItem(externalId: string): Promise<{
    content: Buffer;
    metadata: Record<string, unknown>;
  }> {
    const key = this.toObjectKey(externalId);
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error(`Empty object at key "${key}"`);
    }

    return {
      content: Buffer.from(bytes),
      metadata: {
        key,
        contentType: response.ContentType,
        etag: response.ETag,
        lastModified: response.LastModified?.toISOString(),
      },
    };
  }

  private toExternalId(key: string): string {
    if (this.prefix && key.startsWith(`${this.prefix}/`)) {
      return key.slice(this.prefix.length + 1);
    }
    return key;
  }

  private toObjectKey(externalId: string): string {
    if (!this.prefix) {
      return externalId;
    }
    return `${this.prefix}/${externalId}`;
  }
}
