import { LlmModel } from "../../model/llm-model.model";

import type {
  LlmAudioGenerateInput,
  LlmAudioGenerateResult,
  LlmEmbeddingInput,
  LlmEmbeddingResult,
  LlmTextGenerateInput,
  LlmTextGenerateResult,
  LlmVideoGenerateInput,
  LlmVideoGenerateResult,
  LlmProvider,
} from "../llm-provider.interface";

import type { LlmModelType } from "../llm-model-type";

import type { OpenAiLlmConfig } from "./openai.config";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

interface OpenAiModelEntry {
  id: string;
  owned_by?: string;
}

function inferOpenAiModelType(modelId: string): LlmModelType {
  if (modelId.includes("embedding") || modelId.startsWith("text-embedding")) {
    return "embedding";
  }
  if (
    modelId.includes("dall-e") ||
    modelId.includes("gpt-image") ||
    modelId.includes("image")
  ) {
    return "image";
  }
  if (modelId.includes("whisper") || modelId.includes("tts")) {
    return "audio";
  }
  if (modelId.includes("sora") || modelId.includes("video")) {
    return "video";
  }
  return "text";
}

export class OpenAiLlmProvider implements LlmProvider {
  constructor(private readonly config: OpenAiLlmConfig) {}

  private baseUrl(): string {
    return (this.config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private headers(contentType = false): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
    };
    if (this.config.organizationId) {
      headers["OpenAI-Organization"] = this.config.organizationId;
    }
    if (contentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  async testConnection(): Promise<void> {
    await this.fetchModels();
  }

  async listModels(type?: LlmModelType): Promise<LlmModel[]> {
    const entries = await this.fetchModels();
    const models = entries.map(
      (entry) =>
        new LlmModel({
          modelId: entry.id,
          type: inferOpenAiModelType(entry.id),
          displayName: entry.id,
          metadata: entry.owned_by ? { ownedBy: entry.owned_by } : undefined,
        })
    );
    if (!type) return models;
    return models.filter((model) => model.type === type);
  }

  async generateText(modelId: string, input: LlmTextGenerateInput): Promise<LlmTextGenerateResult> {
    const response = await fetch(`${this.baseUrl()}/chat/completions`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: modelId,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    return {
      modelId,
      content: body.choices?.[0]?.message?.content ?? "",
      usage: body.usage
        ? {
            promptTokens: body.usage.prompt_tokens,
            completionTokens: body.usage.completion_tokens,
            totalTokens: body.usage.total_tokens,
          }
        : undefined,
    };
  }

  async generateEmbedding(
    modelId: string,
    input: LlmEmbeddingInput
  ): Promise<LlmEmbeddingResult> {
    const response = await fetch(`${this.baseUrl()}/embeddings`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: modelId,
        input: input.input,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const body = (await response.json()) as {
      data?: { embedding: number[] }[];
      usage?: { prompt_tokens?: number; total_tokens?: number };
    };

    return {
      modelId,
      embeddings: (body.data ?? []).map((row) => row.embedding),
      usage: body.usage
        ? {
            promptTokens: body.usage.prompt_tokens,
            totalTokens: body.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *streamText(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl()}/chat/completions`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: modelId,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("OpenAI stream body is empty");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const payload = trimmed.slice(6);
        if (payload === "[DONE]") return;

        try {
          const parsed = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }
  }

  async generateVideo(
    _modelId: string,
    _input: LlmVideoGenerateInput
  ): Promise<LlmVideoGenerateResult> {
    throw new Error("OpenAI video generation is not supported by this adapter");
  }

  async generateAudio(
    modelId: string,
    input: LlmAudioGenerateInput
  ): Promise<LlmAudioGenerateResult> {
    const text = input.text ?? input.prompt;
    if (!text) {
      throw new Error("OpenAI audio generation requires text or prompt");
    }

    const response = await fetch(`${this.baseUrl()}/audio/speech`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: modelId,
        input: text,
        voice: input.voice ?? "alloy",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      modelId,
      audioBase64: buffer.toString("base64"),
    };
  }

  private async fetchModels(): Promise<OpenAiModelEntry[]> {
    const response = await fetch(`${this.baseUrl()}/models`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const body = (await response.json()) as { data?: OpenAiModelEntry[] };
    return body.data ?? [];
  }
}
