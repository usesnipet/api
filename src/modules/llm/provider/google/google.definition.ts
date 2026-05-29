import { X_ENCRYPTED_FIELDS, type ConfigSchema } from "@/modules/config-schema";

import type { LlmProviderDefinition } from "../llm-provider.types";
import { googleLlmIcon } from "./google.icon";
import { GoogleLlmProvider } from "./google.llm-provider";

import type { GoogleLlmConfig } from "./google.config";

export const googleLlmConfigSchema: ConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["apiKey"],
  properties: {
    apiKey: { type: "string", minLength: 1 },
    baseUrl: { type: "string", minLength: 1 },
  },
  [X_ENCRYPTED_FIELDS]: ["apiKey"],
};

export const googleLlmDefinition: LlmProviderDefinition<GoogleLlmConfig> = {
  id: "google",
  label: "Google",
  icon: googleLlmIcon,
  configSchema: googleLlmConfigSchema,
  create(config) {
    return new GoogleLlmProvider(config);
  },
};
