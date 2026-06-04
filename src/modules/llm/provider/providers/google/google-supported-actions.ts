import { LLMModelCapabilities } from "../../llm-model-type";

export const GOOGLE_TEXT_SUPPORTED_ACTIONS = [
  "generateContent",
  "streamGenerateContent",
  "batchGenerateContent",
  "generateText",
] as const;

export const GOOGLE_EMBEDDING_SUPPORTED_ACTIONS = [
  "embedContent",
  "embedText",
  "batchEmbedText",
  "batchEmbedContents",
  "asyncBatchEmbedContent",
] as const;

const CAPABILITY_ACTIONS: ReadonlyArray<{
  capability: LLMModelCapabilities;
  actions: readonly string[];
}> = [
  { capability: LLMModelCapabilities.Text, actions: GOOGLE_TEXT_SUPPORTED_ACTIONS },
  { capability: LLMModelCapabilities.Embedding, actions: GOOGLE_EMBEDDING_SUPPORTED_ACTIONS },
];

export function mapActionsToCapabilities(
  supportedActions: readonly string[] | undefined,
): LLMModelCapabilities[] {
  const actions = new Set(supportedActions ?? []);
  return CAPABILITY_ACTIONS.filter(({ actions: mapped }) =>
    mapped.some((action) => actions.has(action)),
  ).map(({ capability }) => capability);
}

export function modelMatchesCapability(
  supportedActions: readonly string[] | undefined,
  capability: LLMModelCapabilities,
): boolean {
  const actions = new Set(supportedActions ?? []);
  const mapping = CAPABILITY_ACTIONS.find(({ capability: mapped }) => mapped === capability);
  return mapping?.actions.some((action) => actions.has(action)) ?? false;
}
