import { Module } from "@nestjs/common";

import { LlmConnectionController } from "./llm-connection.controller";
import { LlmConnectionService } from "./llm-connection.service";
import { LlmProviderFactory } from "./providers/llm-provider.factory";
import { LlmProviderRegistry } from "./providers/llm-provider.registry";

@Module({
  controllers: [LlmConnectionController],
  providers: [LlmConnectionService, LlmProviderRegistry, LlmProviderFactory],
  exports: [LlmConnectionService],
})
export class LlmConnectionModule {}
