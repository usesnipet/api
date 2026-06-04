import type { Content, GenerateContentResponseUsageMetadata } from "@google/genai";
import type {
  LlmChatMessage,
  LlmTextGenerateInput,
  LlmTextGenerateResult,
} from "../../llm-provider.interface";

export function buildContentsFromMessages(messages: LlmChatMessage[]): Content[] {
  return messages.map((message) => ({
    role: mapChatRole(message.role),
    parts: [{ text: message.content }],
  }));
}

export function buildGenerateContentConfig(input: LlmTextGenerateInput) {
  return {
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxTokens !== undefined ? { maxOutputTokens: input.maxTokens } : {}),
  };
}

export function mapTextGenerateResult(
  modelId: string,
  text: string,
  usageMetadata?: GenerateContentResponseUsageMetadata,
): LlmTextGenerateResult {
  return {
    modelId,
    content: text,
    usage: mapUsageMetadata(usageMetadata),
  };
}

export function mapUsageMetadata(usageMetadata?: GenerateContentResponseUsageMetadata) {
  if (!usageMetadata) {
    return undefined;
  }

  return {
    totalTokens: usageMetadata.totalTokenCount,
    promptTokens: usageMetadata.promptTokenCount,
    completionTokens: usageMetadata.candidatesTokenCount,
  };
}

function mapChatRole(role: string): string {
  if (role === "assistant") {
    return "model";
  }
  return "user";
}
