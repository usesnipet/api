import { ProviderFactory } from "@/common/provider/provider.factory";
import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable } from "@nestjs/common";

import { IndexProviderRegistry } from "./index-provider.registry";
import { IndexProviderDefinition } from "./index-provider.types";

import type { KnowledgeIndexRow } from "@/db/schema/knowledge-index";

import type { IndexProvider } from "./index-provider.interface";

@Injectable()
export class IndexProviderFactory extends ProviderFactory<
  KnowledgeIndexRow,
  IndexProvider,
  IndexProviderDefinition
> {
  constructor(registry: IndexProviderRegistry, configSchema: ConfigSchemaService) {
    super(registry, configSchema);
  }
}
