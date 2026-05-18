import type { RunnerContext, RunnerDef } from "@snipet/runner";

export const logRunner: RunnerDef = {
  id: "internal:node:log",
  execute: async (inputs: { message: string }, ctx: RunnerContext) => {
    console.log(inputs.message);
    await ctx.emit("message", inputs.message);
    await ctx.finish();
  }
}