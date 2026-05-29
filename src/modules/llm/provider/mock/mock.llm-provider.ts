import { NotFoundException } from "@nestjs/common";

import { LlmModel } from "../model/llm-model.model";
import { LLMModelCapabilities } from "../llm-model-type";

import type {
  LlmAudioGenerateInput,
  LlmAudioGenerateResult,
  LlmEmbeddingInput,
  LlmEmbeddingResult,
  LlmListModelsOptions,
  LlmTextGenerateInput,
  LlmTextGenerateResult,
  LlmVideoGenerateInput,
  LlmVideoGenerateResult,
  LlmProvider,
} from "../llm-provider.interface";
import type { MockLlmConfig } from "./mock.config";

const MOCK_MODELS: LlmModel[] = [
  new LlmModel({ modelId: "mock-text", capabilities: [LLMModelCapabilities.Text], displayName: "Mock Text" }),
  new LlmModel({
    modelId: "mock-embedding",
    capabilities: [LLMModelCapabilities.Embedding],
    displayName: "Mock Embedding",
  }),
  new LlmModel({ modelId: "mock-video", capabilities: [LLMModelCapabilities.Video], displayName: "Mock Video" }),
  new LlmModel({ modelId: "mock-audio", capabilities: [LLMModelCapabilities.Audio], displayName: "Mock Audio" }),
];

const MOCK_EMBEDDING_VECTOR = [0.1, 0.2, 0.3];

export class MockLlmProvider implements LlmProvider {
  constructor(private readonly config: MockLlmConfig) {}

  async testConnection(): Promise<void> {
    if (this.config.outcome === "failure") {
      throw new Error("Mock connection failed");
    }
  }

  async listModels(options?: LlmListModelsOptions): Promise<LlmModel[]> {
    return MOCK_MODELS.filter((model, index) => {
      if (options?.capability && !model.capabilities.includes(options.capability)) {
        return false;
      }
      if (options?.skip && index < options.skip) {
        return false;
      }
      if (options?.take && index >= (options.skip ?? 0) + options.take) {
        return false;
      }
      return true;
    });
  }

  async getModel(modelId: string): Promise<LlmModel> {
    const model = MOCK_MODELS.find((item) => item.modelId === modelId);
    if (!model) {
      throw new NotFoundException(`Model ${modelId} not found`);
    }
    return model;
  }

  async generateText(modelId: string, input: LlmTextGenerateInput): Promise<LlmTextGenerateResult> {
    const lastMessage = input.messages.at(-1)?.content ?? "";
    return {
      modelId,
      content: `mock:${lastMessage}`,
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    };
  }

  async generateEmbedding(
    modelId: string,
    input: LlmEmbeddingInput
  ): Promise<LlmEmbeddingResult> {
    const items = Array.isArray(input.input) ? input.input : [input.input];
    return {
      modelId,
      embeddings: items.map(() => [...MOCK_EMBEDDING_VECTOR]),
      usage: { promptTokens: items.length, totalTokens: items.length },
    };
  }

  async *streamText(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string> {
    const text = await this.generateText(modelId, input);
    for (const part of text.content.split(" ")) {
      yield `${part} `;
    }
  }

  async generateVideo(
    modelId: string,
    input: LlmVideoGenerateInput
  ): Promise<LlmVideoGenerateResult> {
    return {
      modelId,
      status: "completed",
      videoUrl: `https://mock.local/video?prompt=${encodeURIComponent(input.prompt)}`,
    };
  }

  async generateAudio(
    modelId: string,
    input: LlmAudioGenerateInput
  ): Promise<LlmAudioGenerateResult> {
    return {
      modelId,
      transcript: input.text ?? input.prompt ?? "",
      audioBase64: Buffer.from("mock-audio").toString("base64"),
    };
  }
}
