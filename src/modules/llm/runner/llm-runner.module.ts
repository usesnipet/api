import { Module } from "@nestjs/common";

import { LlmProviderModule } from "../provider/llm-provider.module";

import { LlmRunnerController } from "./llm-runner.controller";
import { LlmRunnerService } from "./llm-runner.service";

@Module({
  imports: [LlmProviderModule],
  controllers: [LlmRunnerController],
  providers: [LlmRunnerService],
  exports: [LlmRunnerService],
})
export class LlmRunnerModule {}
