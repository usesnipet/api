import { relations } from "drizzle-orm";
import { jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { conversation } from "./conversation";

export const conversationMessageRoleEnum = pgEnum("conversation_message_role", [
  "user",
  "assistant",
  "system",
  "tool",
]);

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image"; mediaId: string; mimeType?: string }
  | { type: "audio"; mediaId: string; mimeType?: string }
  | { type: "video"; mediaId: string; mimeType?: string }
  | { type: "file"; mediaId: string; mimeType: string; name?: string };

export const conversationMessage = pgTable("conversation_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: conversationMessageRoleEnum("role").notNull(),
  parts: jsonb("parts").notNull().default([]).$type<ContentPart[]>(),
  metadata: jsonb("metadata").notNull().default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const conversationMessageRelations = relations(conversationMessage, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationMessage.conversationId],
    references: [conversation.id],
  }),
}));

export type ConversationMessageRow = typeof conversationMessage.$inferSelect;
