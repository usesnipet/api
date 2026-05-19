import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const lambdaInvokeRunner: RunnerDef = {
  id: "aws:node:lambda-invoke",
  execute: async (
    inputs: { functionName: string; payload?: unknown },
    ctx: RunnerContext
  ) => {
    const config = requireAwsConfig(ctx.config);
    const client = new LambdaClient(getAwsClientConfig(config));

    const payload = inputs.payload ?? {};
    const result = await client.send(
      new InvokeCommand({
        FunctionName: inputs.functionName,
        Payload: Buffer.from(JSON.stringify(payload)),
      })
    );

    const responsePayload = result.Payload
      ? JSON.parse(Buffer.from(result.Payload).toString("utf-8"))
      : null;

    await ctx.emit("payload", responsePayload);
    await ctx.emit("statusCode", result.StatusCode ?? 0);
    await ctx.finish();
  },
};
