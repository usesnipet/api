import { X_ENCRYPTED_FIELDS, type ConfigSchema } from "@/modules/config-schema";

import type { SourceProviderDefinition } from "../source-provider.types";
import { s3SourceIcon } from "./s3.icon";
import { S3SourceProvider } from "./s3.source-provider";

import type { S3SourceConfig } from "./s3.config";

export const s3SourceConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["bucket", "region"],
  properties: {
    bucket: { type: "string", minLength: 1 },
    region: { type: "string", minLength: 1 },
    endpoint: { type: "string", minLength: 1 },
    prefix: { type: "string" },
    accessKeyId: { type: "string", minLength: 1 },
    secretAccessKey: { type: "string", minLength: 1 },
    forcePathStyle: { type: "boolean" },
  },
  [X_ENCRYPTED_FIELDS]: ["accessKeyId", "secretAccessKey"],
};

export const s3SourceDefinition: SourceProviderDefinition<S3SourceConfig> = {
  id: "s3",
  label: "S3 / MinIO",
  icon: s3SourceIcon,
  configSchema: s3SourceConfigSchema,
  create(config) {
    return new S3SourceProvider(config);
  },
};
