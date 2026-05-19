export interface AwsCredentialsConfig extends Record<string, unknown> {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export function getAwsClientConfig(config: AwsCredentialsConfig) {
  return {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      ...(config.sessionToken ? { sessionToken: config.sessionToken } : {}),
    },
  };
}

export function requireAwsConfig(
  config: Record<string, unknown> | undefined
): AwsCredentialsConfig {
  if (
    typeof config?.region !== "string" ||
    typeof config?.accessKeyId !== "string" ||
    typeof config?.secretAccessKey !== "string"
  ) {
    throw new Error("AWS credentials config is missing or incomplete");
  }
  return config as AwsCredentialsConfig;
}
