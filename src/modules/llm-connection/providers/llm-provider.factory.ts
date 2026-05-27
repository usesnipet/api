import { ProviderFactory } from "@/common/provider/provider.factory";
import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable } from "@nestjs/common";

import { LlmProviderRegistry } from "./llm-provider.registry";
import { LlmProviderDefinition } from "./llm-provider.types";

import type { LlmConnectionRow } from "@/db/schema/llm-connection";

import type { LlmProvider } from "./llm-provider.interface";

@Injectable()
export class LlmProviderFactory extends ProviderFactory<
  LlmConnectionRow,
  LlmProvider,
  LlmProviderDefinition
> {
  constructor(registry: LlmProviderRegistry, configSchema: ConfigSchemaService) {
    super(registry, configSchema);
  }
}
