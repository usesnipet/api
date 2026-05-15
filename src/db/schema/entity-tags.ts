import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { config } from "./config";
import { node } from "./node";
import { nodeType } from "./node-type";
import { packageTable } from "./package";
import { tag, TagRow } from "./tag";

export const packageTag = pgTable('package_tag', {
  packageId: uuid('package_id')
    .notNull()
    .references(() => packageTable.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.packageId, t.tagId] })]);

export const nodeTag = pgTable('node_tag', {
  nodeId: uuid('node_id')
    .notNull()
    .references(() => node.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.nodeId, t.tagId] })]);

export const nodeTypeTag = pgTable('node_type_tag', {
  nodeTypeId: uuid('node_type_id')
    .notNull()
    .references(() => nodeType.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.nodeTypeId, t.tagId] })]);

export const configTag = pgTable( 'config_tag', {
  configId: uuid('config_id')
    .notNull()
    .references(() => config.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.configId, t.tagId] })]);

export type PackageTagRow = typeof packageTag.$inferSelect & { tag?: TagRow };
export type NodeTagRow = typeof nodeTag.$inferSelect & { tag?: TagRow };
export type NodeTypeTagRow = typeof nodeTypeTag.$inferSelect & { tag?: TagRow };
export type ConfigTagRow = typeof configTag.$inferSelect & { tag?: TagRow };
