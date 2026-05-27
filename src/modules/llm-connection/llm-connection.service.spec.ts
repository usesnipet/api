import { ProviderConfigService } from "@/common/provider/provider-config.service";
import { ConfigSchemaService } from "@/modules/config-schema";

import { LlmConnectionService } from "./llm-connection.service";
import { LlmProviderRegistry } from "./providers/llm-provider.registry";
import { openAiLlmConfigSchema } from "./providers/openai/openai.definition";

describe("LlmConnectionService", () => {
  const configSchema = new ConfigSchemaService();
  const providerConfigService = new ProviderConfigService(configSchema);
  const llmProviderRegistry = new LlmProviderRegistry();

  it("toModel omits encrypted config fields", () => {
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
      baseUrl: "https://api.openai.com/v1",
    });
    expect(model.config).not.toHaveProperty("apiKey");
  });
});
