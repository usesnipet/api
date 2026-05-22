import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { pipelineRun } from "./pipeline-run";

export const pipelineStepRunStatusEnum = pgEnum("pipeline_step_run_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const pipelineStepRun = pgTable("pipeline_step_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineRunId: uuid("pipeline_run_id")
    .notNull()
    .references(() => pipelineRun.id, { onDelete: "cascade" }),
  stepIndex: integer("step_index").notNull(),
  status: pipelineStepRunStatusEnum("status").notNull(),
  input: jsonb("input").notNull().default({}),
  output: jsonb("output"),
  error: text("error"),
  metadata: jsonb("metadata").notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
