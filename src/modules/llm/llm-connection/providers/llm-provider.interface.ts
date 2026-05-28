import type { Provider } from "@/common/provider";

import type { LlmModel } from "../model/llm-model.model";
import type { LlmModelType } from "./llm-model-type";

export interface LlmProvider extends Provider {
  listModels(type?: LlmModelType): Promise<LlmModel[]>;
  generateText?(modelId: string, input: LlmTextGenerateInput): Promise<LlmTextGenerateResult>;
  generateEmbedding?(modelId: string, input: LlmEmbeddingInput): Promise<LlmEmbeddingResult>;
  streamText?(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string>;
  generateVideo?(modelId: string, input: LlmVideoGenerateInput): Promise<LlmVideoGenerateResult>;
  generateAudio?(modelId: string, input: LlmAudioGenerateInput): Promise<LlmAudioGenerateResult>;
}

export interface LlmChatMessage {
  role: string;
  content: string;
}

export interface LlmTextGenerateInput {
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

export interface LlmVideoGenerateInput {
  prompt: string;
  durationSeconds?: number;
}

export interface LlmVideoGenerateResult {
  modelId: string;
  videoUrl?: string;
  jobId?: string;
  status: "completed" | "processing";
}

export interface LlmAudioGenerateInput {
  prompt?: string;
  text?: string;
  voice?: string;
}

export interface LlmAudioGenerateResult {
  modelId: string;
  audioBase64?: string;
  audioUrl?: string;
  transcript?: string;
}
