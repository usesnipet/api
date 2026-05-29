import type { ProviderDefinition } from "@/common/provider";

import type { LlmProvider } from "./llm-provider.interface";

export interface LlmProviderDefinition<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> extends ProviderDefinition<TConfig, LlmProvider> {}
