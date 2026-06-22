import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { organization } from "./organization";

export const knowledgeBase = pgTable("knowledge_bases", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  configuration: jsonb("configuration").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  organization: one(organization, {
    fields: [knowledgeBase.organizationId],
    references: [organization.id],
  }),
}));

export type KnowledgeBaseRow = typeof knowledgeBase.$inferSelect;
