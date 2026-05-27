import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";

import { ProviderRegistry } from "./provider.registry";
import { Provider, ProviderDefinition } from "./provider.types";

export type TestConnectionResult = {
  duration: number;
};

@Injectable()
export class ProviderConfigService<TDefinition extends ProviderDefinition = ProviderDefinition> {
  constructor(
    protected readonly configSchema: ConfigSchemaService
  ) {}

  listCatalog(registry: ProviderRegistry<TDefinition>): ProviderDefinition[] {
    return registry.list();
  }

  assertKnown(registry: ProviderRegistry<TDefinition>, providerId: string): void {
    registry.assertKnown(providerId);
  }

  getDefinition(registry: ProviderRegistry<TDefinition>, providerId: string): TDefinition {
    return registry.get(providerId);
  }

  prepareForStorage(
    registry: ProviderRegistry<TDefinition>,
    providerId: string,
    plain: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertKnown(registry, providerId);
    const definition = this.getDefinition(registry, providerId);
    return this.configSchema.prepareForStorage(
      definition.configSchema,
      plain
    );
  }

  prepareForResponse(registry: ProviderRegistry<TDefinition>, providerId: string, stored: Record<string, unknown>): Record<string, unknown> {
    this.assertKnown(registry, providerId);
    const definition = this.getDefinition(registry, providerId);
    return this.configSchema.omitEncryptedFields(
      definition.configSchema,
      stored
    );
  }

  prepareForUse(registry: ProviderRegistry<TDefinition>, providerId: string, stored: Record<string, unknown>): Record<string, unknown> {
    this.assertKnown(registry, providerId);
    const definition = this.getDefinition(registry, providerId);
    return this.configSchema.prepareForUse(
      definition.configSchema,
      stored
    );
  }

  mergePlainConfig(registry: ProviderRegistry<TDefinition>, providerId: string, base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
    this.assertKnown(registry, providerId);
    const definition = this.getDefinition(registry, providerId);
    return this.configSchema.mergePlainConfig(
      definition.configSchema,
      base,
      patch
    );
  }

  /**
   * Builds plain config for a connection test.
   * Without `storedConfig`, validates `config` as a full payload.
   * With `storedConfig`, decrypts the stored row and merges `config` as a patch.
   */
  resolvePlainConfigForTest(
    registry: ProviderRegistry<TDefinition>,
    providerId: string,
    config: Record<string, unknown>,
    storedConfig?: Record<string, unknown>
  ): Record<string, unknown> {
    if (storedConfig === undefined) {
      const definition = this.getDefinition(registry, providerId);
      this.configSchema.assertValid(definition.configSchema, config);
      return config;
    }

    const storedPlain = this.prepareForUse(registry, providerId, storedConfig);
    return this.mergePlainConfig(registry, providerId, storedPlain, config);
  }

  async testConnection(
    registry: ProviderRegistry<TDefinition>,
    factory: { createFromPlain: (providerId: string, plainConfig: Record<string, unknown>) => Provider },
    providerId: string,
    plainConfig: Record<string, unknown>
  ): Promise<TestConnectionResult> {
    const startTime = Date.now();
    this.assertKnown(registry, providerId);
    const provider = factory.createFromPlain(providerId, plainConfig);

    try {
      await provider.testConnection();
      return { duration: Date.now() - startTime };
    } catch (error) {
      throw new UnprocessableEntityException(this.formatConnectionError(error));
    }
  }

  private formatConnectionError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Connection test failed";
  }
}