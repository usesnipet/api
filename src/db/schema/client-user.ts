import { relations } from "drizzle-orm";
import { boolean, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const clientUser = pgTable(
  "client_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    anonymous: boolean("anonymous").notNull(),
    sessionId: varchar("session_id", { length: 255 }),
    externalId: varchar("external_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("users_session_id_key").on(table.sessionId)],
);

export const clientUserRelations = relations(clientUser, () => ({}));

export type ClientUserRow = typeof clientUser.$inferSelect;
