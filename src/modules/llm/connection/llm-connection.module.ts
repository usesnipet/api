import { Module } from "@nestjs/common";

import { LlmProviderModule } from "../provider/llm-provider.module";

import { LlmConnectionController } from "./llm-connection.controller";
import { LlmConnectionService } from "./llm-connection.service";

@Module({
  imports: [LlmProviderModule],
  controllers: [LlmConnectionController],
  providers: [LlmConnectionService],
  exports: [LlmConnectionService],
})
export class LlmConnectionModule {}
