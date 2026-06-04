import { LLMModelCapabilities } from "../../llm-model-type";

const OPENAI_EMBEDDING_ID_PREFIXES = ["text-embedding-"] as const;

const OPENAI_TEXT_ID_PREFIXES = ["gpt-", "chatgpt-", "ft:gpt-"] as const;

const OPENAI_TEXT_ID_EXACT = ["o1", "o3", "o4"] as const;

const OPENAI_NON_TEXT_ID_MARKERS = [
  "embedding",
  "dall-e",
  "tts-",
  "whisper",
  "sora",
  "moderation",
  "gpt-image",
] as const;

const CAPABILITY_RULES: ReadonlyArray<{
  capability: LLMModelCapabilities;
  matches: (modelId: string) => boolean;
}> = [
  {
    capability: LLMModelCapabilities.Embedding,
    matches: (modelId) => hasPrefix(modelId, OPENAI_EMBEDDING_ID_PREFIXES),
  },
  {
    capability: LLMModelCapabilities.Text,
    matches: (modelId) => matchesOpenAiTextModel(modelId),
  },
];

function hasPrefix(modelId: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => modelId.startsWith(prefix));
}

function matchesOpenAiTextModel(modelId: string): boolean {
  if (OPENAI_NON_TEXT_ID_MARKERS.some((marker) => modelId.includes(marker))) {
    return false;
  }

  if (hasPrefix(modelId, OPENAI_TEXT_ID_PREFIXES)) {
    return true;
  }

  return OPENAI_TEXT_ID_EXACT.some((prefix) => modelId.startsWith(prefix));
}

export function inferOpenAiModelCapabilities(modelId: string): LLMModelCapabilities[] {
  const normalizedId = modelId.toLowerCase();
  return CAPABILITY_RULES.filter(({ matches }) => matches(normalizedId)).map(
    ({ capability }) => capability,
  );
}

export function openAiModelMatchesCapability(
  modelId: string,
  capability: LLMModelCapabilities,
): boolean {
  return inferOpenAiModelCapabilities(modelId).includes(capability);
}
