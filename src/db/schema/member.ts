import { relations } from "drizzle-orm";
import { pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { organization } from "./organization";
import { user } from "./user";

export const member = pgTable(
  "members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 255 }).notNull().default("user"),
    status: varchar("status", { length: 255 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.organizationId], name: "members_pkey" }),
  ],
);

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
}));

export type MemberRow = typeof member.$inferSelect;
