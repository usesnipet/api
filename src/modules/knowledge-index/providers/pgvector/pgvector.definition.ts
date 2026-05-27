import { X_ENCRYPTED_FIELDS, type ConfigSchema } from "@/modules/config-schema";

import type { IndexProviderDefinition } from "../index-provider.types";
import { pgvectorIndexIcon } from "./pgvector.icon";
import { PgvectorIndexProvider } from "./pgvector.index-provider";

import type { PgvectorIndexConfig } from "./pgvector.config";

export const pgvectorIndexConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["host", "port", "database", "user", "password"],
  properties: {
    host: { type: "string", minLength: 1 },
    port: { type: "integer", minimum: 1, maximum: 65535 },
    database: { type: "string", minLength: 1 },
    user: { type: "string", minLength: 1 },
    password: { type: "string", minLength: 1 },
    ssl: { type: "boolean" },
  },
  [X_ENCRYPTED_FIELDS]: ["password"],
};

export const pgvectorIndexDefinition: IndexProviderDefinition<PgvectorIndexConfig> = {
  id: "pgvector",
  label: "PostgreSQL (pgvector)",
  icon: pgvectorIndexIcon,
  configSchema: pgvectorIndexConfigSchema,
  create(config) {
    return new PgvectorIndexProvider(config);
  },
};
