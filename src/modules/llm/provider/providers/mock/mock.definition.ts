import type { ConfigSchema } from "@/modules/config-schema";

import type { LlmProviderDefinition } from "../../llm-provider.types";
import { mockLlmIcon } from "./mock.icon";
import { MockLlmProvider } from "./mock.llm-provider";

import type { MockLlmConfig } from "./mock.config";

export const mockLlmConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["outcome"],
  properties: {
    outcome: { type: "string", enum: ["success", "failure"] },
  },
};

export const mockLlmDefinition: LlmProviderDefinition<MockLlmConfig> = {
  id: "mock",
  label: "Mock (tests only)",
  icon: mockLlmIcon,
  configSchema: mockLlmConfigSchema,
  create(config) {
    return new MockLlmProvider(config);
  },
};
