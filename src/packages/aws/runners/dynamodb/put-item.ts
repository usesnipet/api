import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const dynamodbPutItemRunner: RunnerDef = {
  id: "aws:node:dynamodb-put-item",
  execute: async (
    inputs: { tableName: string; item: Record<string, unknown> },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = DynamoDBDocumentClient.from(
      new DynamoDBClient(getAwsClientConfig(config))
    );

    await client.send(
      new PutCommand({
        TableName: inputs.tableName,
        Item: inputs.item,
      })
    );

    await ctx.emit("void", undefined);
    await ctx.finish();
  },
};
