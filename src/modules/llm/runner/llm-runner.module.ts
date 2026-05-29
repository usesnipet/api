import { Module } from "@nestjs/common";

import { LlmConnectionModule } from "../connection/llm-connection.module";

import { LlmRunnerController } from "./llm-runner.controller";
import { LlmRunnerService } from "./llm-runner.service";

@Module({
  imports: [LlmConnectionModule],
  controllers: [LlmRunnerController],
  providers: [LlmRunnerService],
  exports: [LlmRunnerService],
})
export class LlmRunnerModule {}
