import { LlmModel } from "../../model/llm-model.model";
import type { LlmProvider } from "../llm-provider.interface";
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
  return "text";
}

export class OpenAiLlmProvider implements LlmProvider {
  constructor(private readonly config: OpenAiLlmConfig) {}

  private baseUrl(): string {
    return (this.config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
    };
    if (this.config.organizationId) {
      headers["OpenAI-Organization"] = this.config.organizationId;
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
