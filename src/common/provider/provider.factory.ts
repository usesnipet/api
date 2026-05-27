import { ConfigSchemaService } from "@/modules/config-schema";

import { ProviderRegistry } from "./provider.registry";

import type { ProviderDefinition, Provider } from "./provider.types";
export abstract class ProviderFactory<
  TRow extends { provider: string, config: Record<string, unknown> } = { provider: string, config: Record<string, unknown> },
  TProvider extends Provider = Provider,
  TDefinition extends ProviderDefinition<TRow["config"], TProvider> = ProviderDefinition<
    TRow["config"],
    TProvider
  >,
> {
  constructor(
    protected readonly registry: ProviderRegistry<TDefinition>,
    protected readonly configSchema: ConfigSchemaService
  ) {}

  createFromRow(row: TRow): TProvider {
    const definition = this.registry.get(row.provider);
    const config = this.configSchema.prepareForUse(
      definition.configSchema,
      row.config
    );
    return definition.create(config);
  }

  createFromPlain(provider: string, plainConfig: Record<string, unknown>): TProvider {
    const definition = this.registry.get(provider);
    this.configSchema.assertValid(definition.configSchema, plainConfig);
    return definition.create(plainConfig);
  }
}