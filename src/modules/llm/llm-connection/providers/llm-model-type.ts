export const LLM_MODEL_TYPES = [
  "text",
  "embedding",
  "image",
  "video",
  "audio",
] as const;

export type LlmModelType = (typeof LLM_MODEL_TYPES)[number];
