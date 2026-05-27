import { ProviderFactory } from "@/common/provider/provider.factory";
import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable } from "@nestjs/common";

import { SourceProviderRegistry } from "./source-provider.registry";
import { SourceProviderDefinition } from "./source-provider.types";

import type { KnowledgeSourceRow } from "@/db/schema/knowledge-source";

import type { SourceProvider } from "./source-provider.interface";
@Injectable()
export class SourceProviderFactory
  extends ProviderFactory<KnowledgeSourceRow, SourceProvider, SourceProviderDefinition>
{
  constructor(registry: SourceProviderRegistry, configSchema: ConfigSchemaService) {
    super(registry, configSchema);
  }
}
