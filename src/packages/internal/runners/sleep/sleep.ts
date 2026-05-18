import type { RunnerContext, RunnerDef } from "@snipet/runner";

export const sleepRunner: RunnerDef = {
  id: "internal:node:sleep",
  execute: async (inputs: { milliseconds: number }, ctx: RunnerContext) => {
    await new Promise(resolve => setTimeout(resolve, inputs.milliseconds));
    await ctx.finish();
  }
}