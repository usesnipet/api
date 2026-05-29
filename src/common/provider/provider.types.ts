import type { ConfigSchema } from "@/modules/config-schema";

export interface Provider {
  name: string;
  testConnection(): Promise<void>;
}

export interface ProviderDefinition<
 TConfig extends Record<string, unknown> = Record<string, unknown>,
 TProvider extends Provider = Provider,
> {
  id: string;
  label: string;
  icon: string;
  configSchema: ConfigSchema;
  create(config: TConfig): TProvider;
}