import { ProviderConfigService } from "@/common/provider/provider-config.service";
import { ConfigSchemaService } from "@/modules/config-schema";

import { KnowledgeIndexService } from "./knowledge-index.service";
import { IndexProviderRegistry } from "./providers/index-provider.registry";
import { pgvectorIndexConfigSchema } from "./providers/pgvector/pgvector.definition";

describe("KnowledgeIndexService", () => {
  const configSchema = new ConfigSchemaService();
  const providerConfigService = new ProviderConfigService(configSchema);
  const indexProviderRegistry = new IndexProviderRegistry();

  it("toModel omits encrypted config fields", () => {
    const stored = configSchema.prepareForStorage(pgvectorIndexConfigSchema, {
      host: "localhost",
      port: 5432,
      database: "vectors",
      user: "postgres",
      password: "secret",
    });

    const service = Object.create(KnowledgeIndexService.prototype) as KnowledgeIndexService;
    Object.assign(service, {
      providerConfigService,
      indexProviderRegistry,
    });

    const model = (
      service as unknown as {
        toModel(row: {
          id: string;
          name: string;
          description: string;
          provider: string;
          llmConnectionId: string | null;
          config: Record<string, unknown>;
          createdAt: Date;
          updatedAt: Date;
        }): { config: Record<string, unknown> };
      }
    ).toModel({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Vectors",
      description: "pgvector index",
      provider: "pgvector",
      llmConnectionId: null,
      config: stored,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(model.config).toEqual({
      host: "localhost",
      port: 5432,
      database: "vectors",
      user: "postgres",
    });
    expect(model.config).not.toHaveProperty("password");
  });
});
