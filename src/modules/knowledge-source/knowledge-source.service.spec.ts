import { ConfigSchemaService } from "@/modules/config-schema";

import { KnowledgeSourceService } from "./knowledge-source.service";
import { SourceProviderRegistry } from "./providers/source-provider.registry";
import { s3SourceConfigSchema } from "./providers/s3/s3.definition";

describe("KnowledgeSourceService", () => {
  const configSchema = new ConfigSchemaService();
  const sourceProviderRegistry = new SourceProviderRegistry();

  it("toModel omits encrypted config fields", () => {
    const stored = configSchema.prepareForStorage(s3SourceConfigSchema, {
      bucket: "docs",
      region: "us-east-1",
      accessKeyId: "AKIA",
      secretAccessKey: "secret",
    });

    const service = Object.create(KnowledgeSourceService.prototype) as KnowledgeSourceService;
    Object.assign(service, {
      configSchema,
      sourceProviderRegistry,
    });

    const model = (
      service as unknown as {
        toModel(row: {
          id: string;
          name: string;
          description: string;
          provider: string;
          config: Record<string, unknown>;
          createdAt: Date;
          updatedAt: Date;
        }): { config: Record<string, unknown> };
      }
    ).toModel({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Docs",
      description: "S3 bucket",
      provider: "s3",
      config: stored,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(model.config).toEqual({ bucket: "docs", region: "us-east-1" });
    expect(model.config).not.toHaveProperty("accessKeyId");
    expect(model.config).not.toHaveProperty("secretAccessKey");
  });
});
