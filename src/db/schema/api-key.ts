import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const apiKey = pgTable("api_key", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 32 }).notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const apiKeyRelations = relations(apiKey, () => ({}));

export type ApiKeyRow = typeof apiKey.$inferSelect;
