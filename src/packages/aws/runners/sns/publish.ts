import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const snsPublishRunner: RunnerDef = {
  id: "aws:node:sns-publish",
  execute: async (
    inputs: { topicArn: string; message: string; subject?: string },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = new SNSClient(getAwsClientConfig(config));

    const result = await client.send(
      new PublishCommand({
        TopicArn: inputs.topicArn,
        Message: inputs.message,
        ...(inputs.subject ? { Subject: inputs.subject } : {}),
      })
    );

    await ctx.emit("messageId", result.MessageId ?? "");
    await ctx.finish();
  },
};
