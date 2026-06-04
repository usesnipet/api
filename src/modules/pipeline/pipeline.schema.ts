import z from "zod";

export const llmJsonOutputSchema = z.object({
  format: z.literal("json"),
  schema: z.any(),
});
export const llmStreamOutputSchema = z.object({
  format: z.literal("stream"),
});
export const llmTextOutputSchema = z.object({
  format: z.literal("text"),
});
export const llmStepSchema = z.object({
  use: z.literal("llm"),
  connectionId: z.string(),
  models: z.array(z.string()),
  prompt: z.string(),
  stream: z.boolean(),
  output: z.union([
    llmJsonOutputSchema,
    llmStreamOutputSchema,
    llmTextOutputSchema
  ]),
});

export const pipelineSchema = z.object({
  steps: z.union([llmStepSchema]).array(),
});

export type PipelineDefinition = z.infer<typeof pipelineSchema>;