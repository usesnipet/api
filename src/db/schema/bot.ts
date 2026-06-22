import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { knowledgeBase } from "./knowledge-base";
import { memory } from "./memory";
import { organization } from "./organization";

export const bot = pgTable("bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  configuration: jsonb("configuration").notNull().default({}),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const botMemory = pgTable(
  "bot_memories",
  {
    botId: uuid("bot_id")
      .notNull()
      .references(() => bot.id, { onDelete: "cascade" }),
    memoryId: uuid("memory_id")
      .notNull()
      .references(() => memory.id, { onDelete: "cascade" }),
    active: boolean("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.botId, table.memoryId], name: "bot_memories_pkey" }),
    index("bot_memories_bot_id_memory_id_key").on(table.botId, table.memoryId),
  ],
);

export const botKnowledgeBase = pgTable(
  "bot_knowledge_bases",
  {
    botId: uuid("bot_id")
      .notNull()
      .references(() => bot.id, { onDelete: "cascade" }),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBase.id, { onDelete: "cascade" }),
    active: boolean("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({
      columns: [table.botId, table.knowledgeBaseId],
      name: "bot_knowledge_bases_pkey",
    }),
    index("bot_knowledge_bases_bot_id_knowledge_base_id_key").on(
      table.botId,
      table.knowledgeBaseId,
    ),
  ],
);

export const botRelations = relations(bot, ({ one, many }) => ({
  organization: one(organization, {
    fields: [bot.organizationId],
    references: [organization.id],
  }),
  memories: many(botMemory),
  knowledgeBases: many(botKnowledgeBase),
}));

export const botMemoryRelations = relations(botMemory, ({ one }) => ({
  bot: one(bot, {
    fields: [botMemory.botId],
    references: [bot.id],
  }),
  memory: one(memory, {
    fields: [botMemory.memoryId],
    references: [memory.id],
  }),
}));

export const botKnowledgeBaseRelations = relations(botKnowledgeBase, ({ one }) => ({
  bot: one(bot, {
    fields: [botKnowledgeBase.botId],
    references: [bot.id],
  }),
  knowledgeBase: one(knowledgeBase, {
    fields: [botKnowledgeBase.knowledgeBaseId],
    references: [knowledgeBase.id],
  }),
}));

export type BotRow = typeof bot.$inferSelect;
export type BotMemoryRow = typeof botMemory.$inferSelect;
export type BotKnowledgeBaseRow = typeof botKnowledgeBase.$inferSelect;
