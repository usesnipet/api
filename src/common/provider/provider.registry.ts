import { BadRequestException } from "@nestjs/common";

import type { ProviderDefinition } from "./provider.types";

export class ProviderRegistry<
  TDefinition extends ProviderDefinition = ProviderDefinition,
> {
  private readonly definitions = new Map<string, TDefinition>();

  register(definition: TDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw new Error(`Provider "${definition.id}" is already registered`);
    }
    this.definitions.set(definition.id, definition);
  }

  get(id: string): TDefinition {
    const definition = this.definitions.get(id);
    if (!definition) {
      throw new BadRequestException(`Unknown provider "${id}"`);
    }
    return definition;
  }

  has(id: string): boolean {
    return this.definitions.has(id);
  }

  list(): TDefinition[] {
    return [...this.definitions.values()];
  }

  assertKnown(id: string): void {
    this.get(id);
  }
}
