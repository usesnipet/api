import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable } from "@nestjs/common";

import type { KnowledgeSourceRow } from "@/db/schema/knowledge-source";

import type { SourceProvider } from "./source-provider.interface";
import { SourceProviderRegistry } from "./source-provider.registry";

@Injectable()
export class SourceProviderFactory {
  constructor(
    private readonly registry: SourceProviderRegistry,
    private readonly configSchema: ConfigSchemaService
  ) {}

  createFromRow(row: KnowledgeSourceRow): SourceProvider {
    const definition = this.registry.get(row.provider);
    const config = this.configSchema.prepareForUse(
      definition.configSchema,
      row.config as Record<string, unknown>
    );
    return definition.create(config);
  }

  createFromPlain(provider: string, plainConfig: Record<string, unknown>): SourceProvider {
    const definition = this.registry.get(provider);
    this.configSchema.assertValid(definition.configSchema, plainConfig);
    return definition.create(plainConfig as never);
  }
}
