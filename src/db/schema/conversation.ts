import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { bot } from "./bot";
import { clientUser } from "./client-user";
import { memory } from "./memory";
import { organization } from "./organization";

export type MessagePart = {
  type: string;
  content: unknown;
};

export const conversation = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  memoryId: uuid("memory_id")
    .notNull()
    .references(() => memory.id, { onDelete: "restrict" }),
  botId: uuid("bot_id")
    .notNull()
    .references(() => bot.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const clientUserConversation = pgTable(
  "client_user_conversations",
  {
    clientUserId: uuid("client_user_id")
      .notNull()
      .references(() => clientUser.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({
      columns: [table.clientUserId, table.conversationId],
      name: "client_user_conversations_pkey",
    }),
    index("client_user_conversations_client_user_id_conversation_id_key").on(
      table.clientUserId,
      table.conversationId,
    ),
  ],
);

export const conversationMessage = pgTable("conversation_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  clientUserId: uuid("client_user_id")
    .notNull()
    .references(() => clientUser.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 255 }).notNull(),
  parts: jsonb("parts").notNull().default([]).$type<MessagePart[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  organization: one(organization, {
    fields: [conversation.organizationId],
    references: [organization.id],
  }),
  memory: one(memory, {
    fields: [conversation.memoryId],
    references: [memory.id],
  }),
  bot: one(bot, {
    fields: [conversation.botId],
    references: [bot.id],
  }),
  clientUsers: many(clientUserConversation),
  messages: many(conversationMessage),
}));

export const clientUserConversationRelations = relations(clientUserConversation, ({ one }) => ({
  clientUser: one(clientUser, {
    fields: [clientUserConversation.clientUserId],
    references: [clientUser.id],
  }),
  conversation: one(conversation, {
    fields: [clientUserConversation.conversationId],
    references: [conversation.id],
  }),
}));

export const conversationMessageRelations = relations(conversationMessage, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationMessage.conversationId],
    references: [conversation.id],
  }),
  clientUser: one(clientUser, {
    fields: [conversationMessage.clientUserId],
    references: [clientUser.id],
  }),
}));

export type ConversationRow = typeof conversation.$inferSelect;
export type ClientUserConversationRow = typeof clientUserConversation.$inferSelect;
export type ConversationMessageRow = typeof conversationMessage.$inferSelect;
