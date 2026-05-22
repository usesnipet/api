import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { pipeline } from "./pipeline";

export const pipelineRunStatusEnum = pgEnum("pipeline_run_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const pipelineRun = pgTable("pipeline_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipeline.id, { onDelete: "cascade" }),
  status: pipelineRunStatusEnum("status").notNull(),
  input: jsonb("input").notNull().default({}),
  output: jsonb("output"),
  error: text("error"),
  metadata: jsonb("metadata").notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
