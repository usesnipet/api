import type { ProviderDefinition } from "@/common/provider";

import type { SourceProvider } from "./source-provider.interface";

export interface SourceProviderDefinition<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> extends ProviderDefinition<TConfig> {
  create(config: TConfig): SourceProvider;
}
