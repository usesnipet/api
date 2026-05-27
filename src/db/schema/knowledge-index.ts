import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { llmConnection } from "./llm-connection";

export const knowledgeIndex = pgTable("knowledge_index", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  llmConnectionId: uuid("llm_connection_id").references(() => llmConnection.id, {
    onDelete: "set null",
  }),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const knowledgeIndexRelations = relations(knowledgeIndex, () => ({}));

export type KnowledgeIndexRow = typeof knowledgeIndex.$inferSelect;
