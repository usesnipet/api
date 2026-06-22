import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { bot } from "./bot";
import { organization } from "./organization";

export const client = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const clientBot = pgTable(
  "client_bots",
  {
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),
    botId: uuid("bot_id")
      .notNull()
      .references(() => bot.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.clientId, table.botId], name: "client_bots_pkey" }),
    index("client_bots_client_id_bot_id_key").on(table.clientId, table.botId),
  ],
);

export const clientRelations = relations(client, ({ one, many }) => ({
  organization: one(organization, {
    fields: [client.organizationId],
    references: [organization.id],
  }),
  bots: many(clientBot),
}));

export const clientBotRelations = relations(clientBot, ({ one }) => ({
  client: one(client, {
    fields: [clientBot.clientId],
    references: [client.id],
  }),
  bot: one(bot, {
    fields: [clientBot.botId],
    references: [bot.id],
  }),
}));

export type ClientRow = typeof client.$inferSelect;
export type ClientBotRow = typeof clientBot.$inferSelect;
