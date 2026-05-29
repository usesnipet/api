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

export function buildAudioGenerateConfig(voice?: string) {
  return {
    responseModalities: ["audio"],
    ...(voice
      ? {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        }
      : {}),
  };
}

export function extractAudioBase64(response: {
  data?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{ inlineData?: { data?: string } }>;
    };
  }>;
}): string | undefined {
  if (response.data) {
    return response.data;
  }

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }

  return undefined;
}

export async function pollVideosOperation<T extends { done?: boolean }>(
  initial: T,
  poll: (current: T) => Promise<T>,
  options?: { intervalMs?: number; maxAttempts?: number },
): Promise<T> {
  const intervalMs = options?.intervalMs ?? 5_000;
  const maxAttempts = options?.maxAttempts ?? 60;

  let operation = initial;

  for (let attempt = 0; attempt < maxAttempts && !operation.done; attempt++) {
    await sleep(intervalMs);
    operation = await poll(operation);
  }

  return operation;
}

function mapChatRole(role: string): string {
  if (role === "assistant") {
    return "model";
  }
  return "user";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
