import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";

import { TestConnectionResponseDto } from "./dto/test-connection-respose.dto";
import { ProviderCatalogEntryModel } from "./model";
import { ProviderRegistry } from "./provider.registry";
import { Provider, ProviderDefinition } from "./provider.types";

@Injectable()
export class ProviderConfigService<TDefinition extends ProviderDefinition = ProviderDefinition> {
  private readonly logger = new Logger(ProviderConfigService.name);
  constructor(
    protected readonly configSchema: ConfigSchemaService
  ) {}

  listCatalog(registry: ProviderRegistry<TDefinition>): ProviderCatalogEntryModel[] {
    return registry.list().map(
      (entry) => new ProviderCatalogEntryModel(entry)
    );
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
    return this.configSchema.maskEncryptedFieldsForResponse(
      definition.configSchema,
      stored
    );
  }

  prepareForUpdate(
    registry: ProviderRegistry<TDefinition>,
    providerId: string,
    stored: Record<string, unknown>,
    patch: Record<string, unknown>
  ): Record<string, unknown> {
    const storedPlain = this.prepareForUse(registry, providerId, stored);
    const merged = this.mergePlainConfig(registry, providerId, storedPlain, patch);
    return this.prepareForStorage(registry, providerId, merged);
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
  ): Promise<TestConnectionResponseDto> {
    const startTime = Date.now();
    this.assertKnown(registry, providerId);
    const provider = factory.createFromPlain(providerId, plainConfig);

    try {
      await provider.testConnection();
      return new TestConnectionResponseDto(Date.now() - startTime);
    } catch (error) {
      this.logger.error(error);
      throw new UnprocessableEntityException(error.message);
    }
  }
}