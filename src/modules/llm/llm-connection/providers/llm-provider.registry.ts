import { ProviderRegistry } from "@/common/provider";
import { env } from "@/env";
import { Injectable } from "@nestjs/common";

import { googleLlmDefinition } from "./google/google.definition";
import { mockLlmDefinition } from "./mock/mock.definition";
import { openAiLlmDefinition } from "./openai/openai.definition";
import type { LlmProviderDefinition } from "./llm-provider.types";

@Injectable()
export class LlmProviderRegistry extends ProviderRegistry<LlmProviderDefinition> {
  constructor() {
    super();
    this.register(openAiLlmDefinition);
    this.register(googleLlmDefinition);
    if (env.NODE_ENV === "test") {
      this.register(mockLlmDefinition);
    }
  }
}
