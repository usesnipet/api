import type { ProviderDefinition } from "@/common/provider";

import type { IndexProvider } from "./index-provider.interface";

export interface IndexProviderDefinition<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> extends ProviderDefinition<TConfig, IndexProvider> {}
