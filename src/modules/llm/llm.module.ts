import { Module } from "@nestjs/common";

import { LlmConnectionModule } from "./connection/llm-connection.module";
import { LlmProviderModule } from "./provider/llm-provider.module";
import { LlmRunnerModule } from "./runner/llm-runner.module";

@Module({
  imports: [LlmProviderModule, LlmConnectionModule, LlmRunnerModule],
  exports: [LlmProviderModule, LlmConnectionModule, LlmRunnerModule],
})
export class LlmModule {}
