import { ConflictException } from "@nestjs/common";

export type KnowledgeSourceStructuralUpdate = {
  provider?: string;
  config?: Record<string, unknown>;
};

export function assertProviderAndConfigMutable(
  hasSourceItems: boolean,
  changes: KnowledgeSourceStructuralUpdate
): void {
  if (!hasSourceItems) return;

  if (changes.provider !== undefined || changes.config !== undefined) {
    throw new ConflictException(
      "Cannot change provider or config after the first synchronization (source items exist). Create a new knowledge source instead."
    );
  }
}
