import { BaseService } from "@/common/crud";
import { llmConnection as llmConnectionTable } from "@/db/schema/llm-connection";
import {
  BadRequestException, Injectable, NotFoundException, UnprocessableEntityException
} from "@nestjs/common";
import { eq } from "drizzle-orm";

import { LLMModelCapabilities } from "../llm-connection/providers/llm-model-type";
import { LlmProviderFactory } from "../llm-connection/providers/llm-provider.factory";
import { LlmProvider } from "../llm-connection/providers/llm-provider.interface";

import { GenerateAudioDto, GenerateAudioResponseDto } from "./dto/generate-audio.dto";
import { GenerateEmbeddingDto, GenerateEmbeddingResponseDto } from "./dto/generate-embedding.dto";
import { GenerateTextDto, GenerateTextResponseDto } from "./dto/generate-text.dto";
import { GenerateVideoDto, GenerateVideoResponseDto } from "./dto/generate-video.dto";
import { StreamTextDto } from "./dto/stream-text.dto";

@Injectable()
export class LlmRunnerService extends BaseService {
  constructor(private readonly llmProviderFactory: LlmProviderFactory) {
    super();
  }

  async generateText(dto: GenerateTextDto): Promise<GenerateTextResponseDto> {
    const provider = await this.resolveRunnerProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Text);

    try {
      const result = await provider.generateText!(dto.modelId, {
        messages: dto.messages,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
      return new GenerateTextResponseDto(result);
    } catch (error) {
      throw this.toRunnerException(error);
    }
  }

  async generateEmbedding(dto: GenerateEmbeddingDto): Promise<GenerateEmbeddingResponseDto> {
    const provider = await this.resolveRunnerProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Embedding);

    try {
      const result = await provider.generateEmbedding!(dto.modelId, { input: dto.input });
      return new GenerateEmbeddingResponseDto(result);
    } catch (error) {
      throw this.toRunnerException(error);
    }
  }

  async *streamText(dto: StreamTextDto): AsyncIterable<string> {
    const provider = await this.resolveRunnerProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Text);

    try {
      yield* provider.streamText!(dto.modelId, {
        messages: dto.messages,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
    } catch (error) {
      throw this.toRunnerException(error);
    }
  }

  async generateVideo(dto: GenerateVideoDto): Promise<GenerateVideoResponseDto> {
    const provider = await this.resolveRunnerProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Video);

    try {
      const result = await provider.generateVideo!(dto.modelId, {
        prompt: dto.prompt,
        durationSeconds: dto.durationSeconds,
      });
      return new GenerateVideoResponseDto(result);
    } catch (error) {
      throw this.toRunnerException(error);
    }
  }

  async generateAudio(dto: GenerateAudioDto): Promise<GenerateAudioResponseDto> {
    const provider = await this.resolveRunnerProvider(dto.llmConnectionId);
    await this.assertModelCapability(provider, dto.modelId, LLMModelCapabilities.Audio);

    try {
      const result = await provider.generateAudio!(dto.modelId, {
        prompt: dto.prompt,
        text: dto.text,
        voice: dto.voice,
      });
      return new GenerateAudioResponseDto(result);
    } catch (error) {
      throw this.toRunnerException(error);
    }
  }

  private async resolveRunnerProvider(llmConnectionId: string) {
    const [row] = await this.db()
      .select()
      .from(llmConnectionTable)
      .where(eq(llmConnectionTable.id, llmConnectionId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`LLM connection ${llmConnectionId} not found`);
    }

    if (!row.enabled) {
      throw new NotFoundException(`LLM connection ${llmConnectionId} is disabled`);
    }

    return this.llmProviderFactory.createFromRow(row);
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
        throw new BadRequestException(
          `Model ${modelId} is not available for type ${capability} on this connection`
        );
      }
    }
  }

  private toRunnerException(error: unknown): Error {
    if (error instanceof Error && error.message.toLowerCase().includes("not supported")) {
      return new UnprocessableEntityException(error.message);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
