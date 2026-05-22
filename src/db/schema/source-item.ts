import {
  bigint,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { knowledgeSource } from "./knowledge-source";

export const sourceItem = pgTable("source_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  knowledgeSourceId: uuid("knowledge_source_id")
    .notNull()
    .references(() => knowledgeSource.id, { onDelete: "cascade" }),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  hash: varchar("hash", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
