import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const sqsSendMessageRunner: RunnerDef = {
  id: "aws:node:sqs-send-message",
  execute: async (
    inputs: { queueUrl: string; messageBody: string; messageGroupId?: string },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = new SQSClient(getAwsClientConfig(config));

    const result = await client.send(
      new SendMessageCommand({
        QueueUrl: inputs.queueUrl,
        MessageBody: inputs.messageBody,
        ...(inputs.messageGroupId ? { MessageGroupId: inputs.messageGroupId } : {}),
      })
    );

    await ctx.emit("messageId", result.MessageId ?? "");
    await ctx.finish();
  },
};
