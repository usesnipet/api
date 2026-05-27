import { X_ENCRYPTED_FIELDS } from "@/modules/config-schema";

import { mockIndexIcon } from "./mock.icon";
import { MockIndexProvider } from "./mock.index-provider";

import type { ConfigSchema } from "@/modules/config-schema";
import type { IndexProviderDefinition } from "../index-provider.types";
import type { MockIndexConfig } from "./mock.config";

export const mockIndexConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["outcome"],
  properties: {
    outcome: { type: "string", enum: ["success", "failure"] },
    privateKey: { type: "string", minLength: 1 },
  },
  [X_ENCRYPTED_FIELDS]: ["privateKey"],
};

export const mockIndexDefinition: IndexProviderDefinition<MockIndexConfig> = {
  id: "mock",
  label: "Mock (tests only)",
  icon: mockIndexIcon,
  configSchema: mockIndexConfigSchema,
  create(config) {
    return new MockIndexProvider(config);
  },
};
