import { ProviderConfigService } from "@/common/provider/provider-config.service";
import { ConfigSchemaService, ENCRYPTED_FIELD_PLACEHOLDER } from "@/modules/config-schema";

import { LlmConnectionService } from "./llm-connection.service";
import { openAiLlmConfigSchema } from "../provider/openai/openai.definition";
import { LlmProviderRegistry } from "../provider/llm-provider.registry";

describe("LlmConnectionService", () => {
  const configSchema = new ConfigSchemaService();
  const providerConfigService = new ProviderConfigService(configSchema);
  const llmProviderRegistry = new LlmProviderRegistry();

  it("toModel masks encrypted config fields with a placeholder", () => {
    const stored = configSchema.prepareForStorage(openAiLlmConfigSchema, {
      apiKey: "sk-test-key",
      baseUrl: "https://api.openai.com/v1",
    });

    const service = Object.create(LlmConnectionService.prototype) as LlmConnectionService;
    Object.assign(service, {
      providerConfigService,
      llmProviderRegistry,
    });

    const model = (
      service as unknown as {
        toModel(row: {
          id: string;
          name: string;
          provider: string;
          config: Record<string, unknown>;
          enabled: boolean;
          createdAt: Date;
          updatedAt: Date;
        }): { config: Record<string, unknown> };
      }
    ).toModel({
      id: "00000000-0000-4000-8000-000000000001",
      name: "OpenAI prod",
      provider: "openai",
      config: stored,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(model.config).toEqual({
      apiKey: ENCRYPTED_FIELD_PLACEHOLDER,
      baseUrl: "https://api.openai.com/v1",
    });
  });
});
