import OpenAI from "openai";

import { LlmModel } from "../../model/llm-model.model";

import { inferOpenAiModelCapabilities, openAiModelMatchesCapability } from "./openai-model-capabilities";

import type { LlmListModelsOptions, LlmProvider } from "../../llm-provider.interface";
import type { OpenAiLlmConfig } from "./openai.config";

export class OpenAiLlmProvider implements LlmProvider {
  name = "openai";
  private readonly openai: OpenAI;

  constructor(private readonly config: OpenAiLlmConfig) {
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      organization: this.config.organizationId,
    });
  }

  async testConnection(): Promise<void> {
    await this.openai.models.list();
  }

  async listModels(options?: LlmListModelsOptions): Promise<LlmModel[]> {
    const skip = options?.skip ?? 0;
    const take = options?.take;
    const capability = options?.capability;

    const list = await this.openai.models.list();

    let matchedIndex = 0;
    const results: LlmModel[] = [];

    for (const model of list.data) {
      if (capability && !openAiModelMatchesCapability(model.id, capability)) {
        continue;
      }

      if (matchedIndex < skip) {
        matchedIndex++;
        continue;
      }

      if (take !== undefined && results.length >= take) {
        break;
      }

      results.push(this.toLlmModel(model));
      matchedIndex++;
    }

    return results;
  }

  async getModel(modelId: string): Promise<LlmModel> {
    const model = await this.openai.models.retrieve(modelId);
    return this.toLlmModel(model);
  }

  private toLlmModel(model: OpenAI.Models.Model): LlmModel {
    return new LlmModel({
      modelId: model.id,
      capabilities: inferOpenAiModelCapabilities(model.id),
      displayName: model.id,
      metadata: {
        ownedBy: model.owned_by,
      },
    });
  }
}
