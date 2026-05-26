import type { ProviderCatalogEntry, ProviderDefinition } from "./provider.types";
import type { ProviderRegistry } from "./provider.registry";

export function buildProviderCatalog<
  TDefinition extends ProviderDefinition = ProviderDefinition,
>(registry: ProviderRegistry<TDefinition>): ProviderCatalogEntry[] {
  return registry.list().map(({ id, label, icon, configSchema }) => ({
    id,
    label,
    icon,
    configSchema,
  }));
}
