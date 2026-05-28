import { LlmModel } from "../../model/llm-model.model";
import type { LlmProvider } from "../llm-provider.interface";
import type { LlmModelType } from "../llm-model-type";

import type { GoogleLlmConfig } from "./google.config";

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

interface GoogleModelEntry {
  name: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
}

function toModelId(name: string): string {
  return name.startsWith("models/") ? name.slice("models/".length) : name;
}

function inferGoogleModelType(modelId: string, methods: string[] = []): LlmModelType {
  const id = modelId.toLowerCase();
  if (id.includes("embedding")) return "embedding";
  if (id.includes("imagen") || methods.includes("predict")) return "image";
  if (methods.includes("generateContent") || methods.includes("countTokens")) {
    return "text";
  }
  return "text";
}

export class GoogleLlmProvider implements LlmProvider {
  constructor(private readonly config: GoogleLlmConfig) {}

  private baseUrl(): string {
    return (this.config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private modelsUrl(): string {
    const url = new URL(`${this.baseUrl()}/models`);
    url.searchParams.set("key", this.config.apiKey);
    return url.toString();
  }

  async testConnection(): Promise<void> {
    await this.fetchModels();
  }

  async listModels(type?: LlmModelType): Promise<LlmModel[]> {
    const entries = await this.fetchModels();
    const models = entries.map((entry) => {
      const modelId = toModelId(entry.name);
      const methods = entry.supportedGenerationMethods ?? [];
      return new LlmModel({
        modelId,
        type: inferGoogleModelType(modelId, methods),
        displayName: entry.displayName ?? modelId,
        metadata: methods.length > 0 ? { supportedGenerationMethods: methods } : undefined,
      });
    });
    if (!type) return models;
    return models.filter((model) => model.type === type);
  }

  private async fetchModels(): Promise<GoogleModelEntry[]> {
    const response = await fetch(this.modelsUrl());

    if (!response.ok) {
      throw new Error(`Google Generative Language API returned ${response.status}`);
    }

    const body = (await response.json()) as { models?: GoogleModelEntry[] };
    return body.models ?? [];
  }
}
