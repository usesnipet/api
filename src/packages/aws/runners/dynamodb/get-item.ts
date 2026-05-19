import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const dynamodbGetItemRunner: RunnerDef = {
  id: "aws:node:dynamodb-get-item",
  execute: async (
    inputs: { tableName: string; key: Record<string, unknown> },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = DynamoDBDocumentClient.from(
      new DynamoDBClient(getAwsClientConfig(config))
    );

    const result = await client.send(
      new GetCommand({
        TableName: inputs.tableName,
        Key: inputs.key,
      })
    );

    await ctx.emit("item", result.Item ?? null);
    await ctx.finish();
  },
};
