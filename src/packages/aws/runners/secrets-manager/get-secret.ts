import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import type { RunnerContext, RunnerDef } from "@snipet/runner";

import { getAwsClientConfig, requireAwsConfig } from "../lib/credentials";

export const secretsManagerGetSecretRunner: RunnerDef = {
  id: "aws:node:secrets-manager-get-secret",
  execute: async (inputs: { secretId: string }, ctx: RunnerContext) => {
    const config = requireAwsConfig(ctx.config);
    const client = new SecretsManagerClient(getAwsClientConfig(config));

    const result = await client.send(
      new GetSecretValueCommand({
        SecretId: inputs.secretId,
      })
    );

    await ctx.emit("secretString", result.SecretString ?? "");
    await ctx.finish();
  },
};
