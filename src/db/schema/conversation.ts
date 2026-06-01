import { relations } from "drizzle-orm";
import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { conversationMessage } from "./conversation-message";

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }),
  metadata: jsonb("metadata").notNull().default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const conversationRelations = relations(conversation, ({ many }) => ({
  messages: many(conversationMessage),
}));

export type ConversationRow = typeof conversation.$inferSelect;
