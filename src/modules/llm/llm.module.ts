import { Module } from "@nestjs/common";

import { LlmConnectionModule } from "./connection/llm-connection.module";
import { LlmRunnerModule } from "./runner/llm-runner.module";

@Module({
  imports: [LlmConnectionModule, LlmRunnerModule],
  exports: [LlmConnectionModule, LlmRunnerModule],
})
export class LlmModule {}
