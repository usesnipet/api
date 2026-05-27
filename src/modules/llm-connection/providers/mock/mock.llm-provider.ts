import { LlmModel } from "../../model/llm-model.model";
import type { LlmProvider } from "../llm-provider.interface";
import type { LlmModelType } from "../llm-model-type";

import type { MockLlmConfig } from "./mock.config";

const MOCK_MODELS: LlmModel[] = [
  new LlmModel({ modelId: "mock-text", type: "text", displayName: "Mock Text" }),
  new LlmModel({
    modelId: "mock-embedding",
    type: "embedding",
    displayName: "Mock Embedding",
  }),
];

export class MockLlmProvider implements LlmProvider {
  constructor(private readonly config: MockLlmConfig) {}

  async testConnection(): Promise<void> {
    if (this.config.outcome === "failure") {
      throw new Error("Mock connection failed");
    }
  }

  async listModels(type?: LlmModelType): Promise<LlmModel[]> {
    if (!type) return [...MOCK_MODELS];
    return MOCK_MODELS.filter((model) => model.type === type);
  }
}
