import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

import type { RunnerContext, RunnerDef } from "@snipet/runner";

export const s3PutObjectRunner: RunnerDef = {
  id: "aws:node:s3-put-object",
  execute: async (
    inputs: { bucket: string; key: string; body: File; contentType?: string },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = new S3Client(getAwsClientConfig(config));

    const result = await client.send(
      new PutObjectCommand({
        Bucket: inputs.bucket,
        Key: inputs.key,
        Body: inputs.body,
        ContentType: inputs.contentType ?? "application/octet-stream",
      })
    );

    await ctx.emit("etag", result.ETag ?? "");
    await ctx.finish();
  },
};
