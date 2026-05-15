import { FieldManifest } from "@/core/manifest/field";
import { index, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import moment from "moment";

import { packageTable } from "./package";

import type { ConfigTagRow } from "./entity-tags";

export const config = pgTable(
  'config',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    configId: varchar('config_id', { length: 512 }).notNull(),
    packageId: uuid('package_id').notNull().references(() => packageTable.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text('description'),
    docs: text('docs'),
    icon: text('icon'),
    author: text('author'),
    fieldManifest: jsonb('field_schema').notNull().$type<Array<FieldManifest>>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => moment().toISOString()),
  },
  (t) => [unique().on(t.configId), index('config_package_id_idx').on(t.packageId)],
);

export type ConfigRow = typeof config.$inferSelect & { configTags?: ConfigTagRow[] };
