import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { organization } from "./organization";

export const memory = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  provider: varchar("provider", { length: 255 }).notNull(),
  configuration: jsonb("configuration").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const memoryRelations = relations(memory, ({ one }) => ({
  organization: one(organization, {
    fields: [memory.organizationId],
    references: [organization.id],
  }),
}));

export type MemoryRow = typeof memory.$inferSelect;
