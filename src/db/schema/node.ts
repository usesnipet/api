import { index, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import moment from "moment";

import { config, ConfigRow } from "./config";
import { nodeType, NodeTypeRow } from "./node-type";
import { PackageRow, packageTable } from "./package";

import type { NodeTagRow } from './entity-tags';
export const node = pgTable(
  'node',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nodeId: varchar('node_id', { length: 512 }).notNull(),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packageTable.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text('description'),
    docs: text('docs'),
    icon: text('icon'),
    nodeTypeId: uuid('node_type_id')
      .notNull()
      .references(() => nodeType.id, { onDelete: 'restrict' }),
    configId: uuid('config_id').references(() => config.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => moment().toISOString()),
  },
  (t) => [
    unique().on(t.nodeId),
    index('node_package_id_idx').on(t.packageId),
    index('node_node_type_id_idx').on(t.nodeTypeId),
    index('node_config_id_idx').on(t.configId),
  ],
);

export type NodeRow = typeof node.$inferSelect & { nodeTags?: NodeTagRow[], package?: PackageRow, nodeType?: NodeTypeRow, config?: ConfigRow };
