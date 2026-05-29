import { llmConnection } from "@/db/schema/llm-connection";
import { eq } from "drizzle-orm";

import { LlmErrorCode, LlmException } from "../provider/errors";

import type { DatabaseSession } from "@/db/types";

import type { LlmProvider } from "../provider/llm-provider.interface";
import type { LlmConnectionRow } from "@/db/schema/llm-connection";

type LlmProviderFactoryLike = {
  createFromRow(row: LlmConnectionRow): LlmProvider;
};

export async function resolveEnabledLlmConnection(
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
    throw new LlmException(
      LlmErrorCode.CONNECTION_NOT_FOUND,
      `Connection ${connectionId} not found`,
      { connectionId },
    );
  }
  if (!row.enabled) {
    throw new LlmException(
      LlmErrorCode.CONNECTION_DISABLED,
      `Connection ${connectionId} is disabled`,
      { connectionId },
    );
  }

  return factory.createFromRow(row);
}
