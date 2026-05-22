import { jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const memoryScopeTypeEnum = pgEnum("memory_scope_type", [
  "global",
  "session",
  "custom",
]);

export const memory = pgTable("memory", {
  id: uuid("id").primaryKey().defaultRandom(),
  scopeType: memoryScopeTypeEnum("scope_type").notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
