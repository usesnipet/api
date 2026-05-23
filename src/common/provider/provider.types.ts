import type { ConfigSchema } from "@/modules/config-schema";

export interface ProviderDefinition<TConfig extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  label: string;
  configSchema: ConfigSchema;
  create(config: TConfig): unknown;
}

export interface ProviderCatalogEntry {
  id: string;
  label: string;
  configSchema: ConfigSchema;
}
