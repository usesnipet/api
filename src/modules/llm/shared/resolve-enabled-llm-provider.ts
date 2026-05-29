import { llmConnection } from "@/db/schema/llm-connection";
import { NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import type { DatabaseSession } from "@/db/types";

import type { LlmProvider } from "../provider/llm-provider.interface";
import type { LlmConnectionRow } from "@/db/schema/llm-connection";

type LlmProviderFactoryLike = {
  createFromRow(row: LlmConnectionRow): LlmProvider;
};

export async function resolveEnabledLlmProvider(
  db: DatabaseSession,
  connectionId: string,
  factory: LlmProviderFactoryLike
): Promise<LlmProvider> {
  const [row] = await db
    .select()
    .from(llmConnection)
    .where(eq(llmConnection.id, connectionId))
    .limit(1);

  if (!row) {
    throw new NotFoundException(`LLM connection ${connectionId} not found`);
  }
  if (!row.enabled) {
    throw new NotFoundException(`LLM connection ${connectionId} is disabled`);
  }

  return factory.createFromRow(row);
}