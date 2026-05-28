import { Module } from "@nestjs/common";

import { LlmConnectionModule } from "./llm-connection/llm-connection.module";
import { LlmRunnerModule } from "./llm-runner/llm-runner.module";

@Module({
  imports: [LlmConnectionModule, LlmRunnerModule],
  exports: [LlmConnectionModule, LlmRunnerModule],
})
export class LlmModule {}
