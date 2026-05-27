import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const llmConnection = pgTable("llm_connection", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  config: jsonb("config").notNull().default({}).$type<Record<string, unknown>>(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const llmConnectionRelations = relations(llmConnection, () => ({}));

export type LlmConnectionRow = typeof llmConnection.$inferSelect;
