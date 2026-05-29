import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { LlmExceptionFilter } from "./errors/llm-exception.filter";
import { LlmProviderFactory } from "./llm-provider.factory";
import { LlmProviderRegistry } from "./llm-provider.registry";

@Module({
  providers: [
    LlmProviderRegistry,
    LlmProviderFactory,
    {
      provide: APP_FILTER,
      useClass: LlmExceptionFilter,
    },
  ],
  exports: [LlmProviderRegistry, LlmProviderFactory],
})
export class LlmProviderModule {}
