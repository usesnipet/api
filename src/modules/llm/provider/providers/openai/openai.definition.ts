import { X_ENCRYPTED_FIELDS } from "@/modules/config-schema";

import { openAiLlmIcon } from "./openai.icon";
import { OpenAiLlmProvider } from "./openai.llm-provider";

import type { ConfigSchema } from "@/modules/config-schema";
import type { LlmProviderDefinition } from "../../llm-provider.types";
import type { OpenAiLlmConfig } from "./openai.config";

export const openAiLlmConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["apiKey"],
  properties: {
    apiKey: { type: "string", minLength: 1 },
    baseUrl: { type: "string", minLength: 1 },
    organizationId: { type: "string", minLength: 1 },
  },
  [X_ENCRYPTED_FIELDS]: ["apiKey"],
};

export const openAiLlmDefinition: LlmProviderDefinition<OpenAiLlmConfig> = {
  id: "openai",
  label: "OpenAI",
  icon: openAiLlmIcon,
  configSchema: openAiLlmConfigSchema,
  create(config) {
    return new OpenAiLlmProvider(config);
  },
};
