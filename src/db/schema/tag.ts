import { pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const tag = pgTable('tag', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
}, (t) => [unique().on(t.name)]);

export type TagRow = typeof tag.$inferSelect;
