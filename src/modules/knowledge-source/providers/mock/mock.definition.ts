import type { ConfigSchema } from "@/modules/config-schema";

import type { SourceProviderDefinition } from "../source-provider.types";
import { mockSourceIcon } from "./mock.icon";
import { MockSourceProvider } from "./mock.source-provider";

import type { MockSourceConfig } from "./mock.config";

export const mockSourceConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["outcome"],
  properties: {
    outcome: { type: "string", enum: ["success", "failure"] },
  },
};

export const mockSourceDefinition: SourceProviderDefinition<MockSourceConfig> = {
  id: "mock",
  label: "Mock (tests only)",
  icon: mockSourceIcon,
  configSchema: mockSourceConfigSchema,
  create(config) {
    return new MockSourceProvider(config);
  },
};
