import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { knowledgeIndex } from "./knowledge-index";
import { sourceItem } from "./source-item";

export const indexedItemStatusEnum = pgEnum("indexed_item_status", [
  "discovered",
  "queued",
  "processing",
  "processed",
  "failed",
  "stale",
  "skipped",
  "deleted",
]);

export const indexedItem = pgTable("indexed_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  knowledgeIndexId: uuid("knowledge_index_id")
    .notNull()
    .references(() => knowledgeIndex.id, { onDelete: "cascade" }),
  knowledgeSourceItemId: uuid("knowledge_source_item_id")
    .notNull()
    .references(() => sourceItem.id, { onDelete: "cascade" }),
  status: indexedItemStatusEnum("status").notNull(),
  error: text("error"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
