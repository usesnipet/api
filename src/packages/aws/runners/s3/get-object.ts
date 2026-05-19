import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const s3GetObjectRunner: RunnerDef = {
  id: "aws:node:s3-get-object",
  execute: async (inputs: { bucket: string; key: string }, ctx: RunnerContext) => {
    const config = requireAwsConfig(ctx.config);
    const client = new S3Client(getAwsClientConfig(config));

    const result = await client.send(
      new GetObjectCommand({
        Bucket: inputs.bucket,
        Key: inputs.key,
      })
    );

    const body = result.Body ? await result.Body.transformToString() : "";
    await ctx.emit("body", body);
    await ctx.emit("contentType", result.ContentType ?? "application/octet-stream");
    await ctx.finish();
  },
};
