import { GoogleGenAI } from "@google/genai";

import { LlmModel } from "../model/llm-model.model";

import {
  buildAudioGenerateConfig, buildContentsFromMessages, buildGenerateContentConfig, extractAudioBase64,
  mapTextGenerateResult, pollVideosOperation
} from "./google-generation";
import { mapActionsToCapabilities, modelMatchesCapability } from "./google-supported-actions";

import type { Model } from "@google/genai";

import type {
  LlmAudioGenerateInput,
  LlmAudioGenerateResult,
  LlmEmbeddingInput,
  LlmEmbeddingResult,
  LlmListModelsOptions,
  LlmProvider,
  LlmTextGenerateInput,
  LlmTextGenerateResult,
  LlmVideoGenerateInput,
  LlmVideoGenerateResult,
} from "../llm-provider.interface";
import type { GoogleLlmConfig } from "./google.config";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1000;

export class GoogleLlmProvider implements LlmProvider {
  private readonly googleGenAI: GoogleGenAI;

  constructor(private readonly config: GoogleLlmConfig) {
    this.googleGenAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });
  }

  async testConnection(): Promise<void> {
    await this.googleGenAI.models.list();
  }

  async listModels(options?: LlmListModelsOptions): Promise<LlmModel[]> {
    const skip = options?.skip ?? 0;
    const take = options?.take;
    const capability = options?.capability;

    const pager = await this.googleGenAI.models.list({
      config: { pageSize: this.resolvePageSize(skip, take, capability) },
    });

    let matchedIndex = 0;
    const results: LlmModel[] = [];

    for await (const model of pager) {
      if (capability && !modelMatchesCapability(model.supportedActions, capability)) {
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
    const model = await this.googleGenAI.models.get({ model: modelId });
    return this.toLlmModel(model);
  }

  async generateText(
    modelId: string,
    input: LlmTextGenerateInput,
  ): Promise<LlmTextGenerateResult> {
    const result = await this.googleGenAI.models.generateContent({
      model: modelId,
      contents: buildContentsFromMessages(input.messages),
      config: buildGenerateContentConfig(input),
    });

    return mapTextGenerateResult(modelId, result.text ?? "", result.usageMetadata);
  }

  async *streamText(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string> {
    const stream = await this.googleGenAI.models.generateContentStream({
      model: modelId,
      contents: buildContentsFromMessages(input.messages),
      config: buildGenerateContentConfig(input),
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  }

  async generateEmbedding(
    modelId: string,
    input: LlmEmbeddingInput,
  ): Promise<LlmEmbeddingResult> {
    const items = Array.isArray(input.input) ? input.input : [input.input];
    const result = await this.googleGenAI.models.embedContent({
      model: modelId,
      contents: items,
    });

    const embeddings = (result.embeddings ?? []).map(
      (embedding) => embedding.values ?? [],
    );

    const tokenCount = result.embeddings?.[0]?.statistics?.tokenCount;

    return {
      modelId,
      embeddings,
      usage: tokenCount !== undefined
        ? { promptTokens: tokenCount, totalTokens: tokenCount }
        : undefined,
    };
  }

  async generateVideo(
    modelId: string,
    input: LlmVideoGenerateInput,
  ): Promise<LlmVideoGenerateResult> {
    let operation = await this.googleGenAI.models.generateVideos({
      model: modelId,
      source: { prompt: input.prompt },
      config: {
        numberOfVideos: 1,
        ...(input.durationSeconds !== undefined
          ? { durationSeconds: input.durationSeconds }
          : {}),
      },
    });

    operation = await pollVideosOperation(
      operation,
      (current) => this.googleGenAI.operations.getVideosOperation({ operation: current }),
    );

    if (!operation.done) {
      return {
        modelId,
        status: "processing",
        jobId: operation.name,
      };
    }

    const video = operation.response?.generatedVideos?.[0]?.video;

    return {
      modelId,
      status: "completed",
      videoUrl: video?.uri,
      jobId: operation.name,
    };
  }

  async generateAudio(
    modelId: string,
    input: LlmAudioGenerateInput,
  ): Promise<LlmAudioGenerateResult> {
    const text = input.text ?? input.prompt;
    if (!text) {
      throw new Error("Text or prompt is required for audio generation");
    }

    const result = await this.googleGenAI.models.generateContent({
      model: modelId,
      contents: text,
      config: buildAudioGenerateConfig(input.voice),
    });

    return {
      modelId,
      transcript: text,
      audioBase64: extractAudioBase64(result),
    };
  }

  private resolvePageSize(
    skip: number,
    take: number | undefined,
    capability?: LlmListModelsOptions["capability"],
  ): number {
    if (capability) {
      return MAX_PAGE_SIZE;
    }

    if (take !== undefined) {
      return Math.min(Math.max(skip + take, 1), MAX_PAGE_SIZE);
    }

    return DEFAULT_PAGE_SIZE;
  }

  private toLlmModel(model: Model): LlmModel {
    return new LlmModel({
      modelId: model.name ?? "",
      capabilities: mapActionsToCapabilities(model.supportedActions),
      displayName: model.displayName ?? model.name,
      metadata: {},
    });
  }
}
