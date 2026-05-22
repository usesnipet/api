import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { knowledgeIndex } from "./knowledge-index";
import { knowledgeSource } from "./knowledge-source";

export const sourceIndex = pgTable(
  "source_index",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeSourceId: uuid("knowledge_source_id")
      .notNull()
      .references(() => knowledgeSource.id, { onDelete: "cascade" }),
    knowledgeIndexId: uuid("knowledge_index_id")
      .notNull()
      .references(() => knowledgeIndex.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("source_index_knowledge_source_id_knowledge_index_id_unique").on(
      table.knowledgeSourceId,
      table.knowledgeIndexId,
    ),
  ],
);
