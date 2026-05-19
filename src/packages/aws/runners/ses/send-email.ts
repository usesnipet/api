import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const sesSendEmailRunner: RunnerDef = {
  id: "aws:node:ses-send-email",
  execute: async (
    inputs: { from: string; to: string; subject: string; body: string },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = new SESClient(getAwsClientConfig(config));

    const result = await client.send(
      new SendEmailCommand({
        Source: inputs.from,
        Destination: { ToAddresses: [inputs.to] },
        Message: {
          Subject: { Data: inputs.subject, Charset: "UTF-8" },
          Body: { Text: { Data: inputs.body, Charset: "UTF-8" } },
        },
      })
    );

    await ctx.emit("messageId", result.MessageId ?? "");
    await ctx.finish();
  },
};
