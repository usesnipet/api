import { BaseService, ReadOpts } from "@/common/crud";
import { Injectable } from "@nestjs/common";

import { LlmErrorCode, LlmException } from "../provider/errors";
import { LLMModelCapabilities } from "../provider/llm-model-type";
import { LlmProviderFactory } from "../provider/llm-provider.factory";
import { LlmProvider } from "../provider/llm-provider.interface";
import { resolveEnabledLlmConnection } from "../shared/resolve-enabled-llm-provider";

import { GenerateEmbeddingDto, GenerateEmbeddingResponseDto } from "./dto/generate-embedding.dto";
import { GenerateTextDto, GenerateTextResponseDto } from "./dto/generate-text.dto";
import { StreamTextDto } from "./dto/stream-text.dto";

@Injectable()
export class LlmRunnerService extends BaseService {
  constructor(private readonly llmProviderFactory: LlmProviderFactory) {
    super();
  }

  async generateText(dto: GenerateTextDto): Promise<GenerateTextResponseDto> {
    const provider = await this.resolveProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Text);

    const result = await provider.generateText!(dto.modelId, {
      prompt: dto.prompt,
      messages: dto.messages,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
    });
    return new GenerateTextResponseDto(result);
  }

  async generateEmbedding(dto: GenerateEmbeddingDto): Promise<GenerateEmbeddingResponseDto> {
    const provider = await this.resolveProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Embedding);

    const result = await provider.generateEmbedding!(dto.modelId, { input: dto.input });
    return new GenerateEmbeddingResponseDto(result);
  }

  async *streamText(dto: StreamTextDto): AsyncIterable<string> {
    const provider = await this.resolveProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Text);

    yield* provider.streamText!(dto.modelId, {
      messages: dto.messages,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
    });
  }

  private async resolveProvider(llmConnectionId: string, opts?: ReadOpts) {
    return resolveEnabledLlmConnection(
      this.db(opts),
      llmConnectionId,
      this.llmProviderFactory,
    );
  }

  private async assertModelCapability(
    provider: LlmProvider,
    modelId: string,
    expectedCapability: LLMModelCapabilities | LLMModelCapabilities[]
  ): Promise<void> {
    const model = await provider.getModel(modelId);
    const capabilities = Array.isArray(expectedCapability) ? expectedCapability : [expectedCapability];
    for (const capability of capabilities) {
      if (!model.capabilities.includes(capability)) {
        throw new LlmException(
          LlmErrorCode.MODEL_CAPABILITY_MISMATCH,
          `Model ${modelId} does not support capability ${capability}`,
          {
            modelId,
            capability,
            provider: provider.name,
          },
        );
      }
    }
  }
}
