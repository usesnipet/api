import type { Provider } from "@/common/provider";

import type { LlmModel } from "./model/llm-model.model";
import type { LLMModelCapabilities } from "./llm-model-type";

export interface LlmListModelsOptions {
  capability?: LLMModelCapabilities;
  take?: number;
  skip?: number;
}

export interface LlmProvider extends Provider {
  listModels(options?: LlmListModelsOptions): Promise<LlmModel[]>;
  getModel(modelId: string): Promise<LlmModel>;
  generateText?(modelId: string, input: LlmTextGenerateInput): Promise<LlmTextGenerateResult>;
  generateEmbedding?(modelId: string, input: LlmEmbeddingInput): Promise<LlmEmbeddingResult>;
  streamText?(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string>;
}

export interface LlmChatMessage {
  role: string;
  content: string;
}

export interface LlmTextGenerateInput {
  prompt?: string;
  messages: LlmChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmTextGenerateResult {
  content: string;
  modelId: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface LlmEmbeddingInput {
  input: string | string[];
}

export interface LlmEmbeddingResult {
  modelId: string;
  embeddings: number[][];
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  };
}
