import { Module } from "@nestjs/common";

import { LlmProviderFactory } from "./llm-provider.factory";
import { LlmProviderRegistry } from "./llm-provider.registry";

@Module({
  providers: [LlmProviderRegistry, LlmProviderFactory],
  exports: [LlmProviderRegistry, LlmProviderFactory],
})
export class LlmProviderModule {}
