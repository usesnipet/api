import { FlowManifest } from "@/core/manifest/flow";
import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import moment from "moment";

export const flow = pgTable('flow', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  code: jsonb('code').notNull().$type<FlowManifest>().default(new FlowManifest()),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => moment().toISOString()),
});

export type FlowRow = typeof flow.$inferSelect;