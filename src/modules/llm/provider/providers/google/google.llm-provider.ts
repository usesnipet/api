import { GoogleGenAI } from "@google/genai";

import { LlmModel } from "../../model/llm-model.model";

import {
  buildContentsFromMessages,
  buildGenerateContentConfig,
  mapTextGenerateResult,
} from "./google-generation";
import { mapGoogleError } from "./google-error.mapper";
import { mapActionsToCapabilities, modelMatchesCapability } from "./google-supported-actions";

import type { Model } from "@google/genai";

import type {
  LlmEmbeddingInput,
  LlmEmbeddingResult,
  LlmListModelsOptions,
  LlmProvider,
  LlmTextGenerateInput,
  LlmTextGenerateResult,
} from "../../llm-provider.interface";
import type { GoogleErrorContext } from "./google-error.mapper";
import type { GoogleLlmConfig } from "./google.config";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1000;

export class GoogleLlmProvider implements LlmProvider {
  name = "llm-google";
  private readonly googleGenAI: GoogleGenAI;

  constructor(private readonly config: GoogleLlmConfig) {
    this.googleGenAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });
  }

  async testConnection(): Promise<void> {
    await this.run("testConnection", () => this.googleGenAI.models.list());
  }

  async listModels(options?: LlmListModelsOptions): Promise<LlmModel[]> {
    return this.run("listModels", async () => {
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
    });
  }

  async getModel(modelId: string): Promise<LlmModel> {
    return this.run(
      "getModel",
      async () => this.toLlmModel(await this.googleGenAI.models.get({ model: modelId })),
      { modelId },
    );
  }

  async generateText(
    modelId: string,
    input: LlmTextGenerateInput,
  ): Promise<LlmTextGenerateResult> {
    return this.run(
      "generateText",
      async () => {
        const result = await this.googleGenAI.models.generateContent({
          model: modelId,
          contents: buildContentsFromMessages(input.messages),
          config: buildGenerateContentConfig(input),
        });

        return mapTextGenerateResult(modelId, result.text ?? "", result.usageMetadata);
      },
      { modelId },
    );
  }

  async *streamText(modelId: string, input: LlmTextGenerateInput): AsyncIterable<string> {
    yield* this.run(
      "streamText",
      async function* (this: GoogleLlmProvider) {
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
      }.bind(this),
      { modelId, stream: true },
    );
  }

  async generateEmbedding(
    modelId: string,
    input: LlmEmbeddingInput,
  ): Promise<LlmEmbeddingResult> {
    return this.run(
      "generateEmbedding",
      async () => {
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
      },
      { modelId },
    );
  }

  private run<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: GoogleErrorContext,
  ): Promise<T>;
  private run(
    operation: string,
    fn: () => AsyncGenerator<string, void, unknown>,
    context: GoogleErrorContext & { stream: true },
  ): AsyncGenerator<string, void, unknown>;
  private run<T>(
    operation: string,
    fn: () => Promise<T> | AsyncGenerator<string, void, unknown>,
    context: GoogleErrorContext & { stream?: true } = {},
  ): Promise<T> | AsyncGenerator<string, void, unknown> {
    if (context.stream) {
      return this.runStream(operation, fn as () => AsyncGenerator<string, void, unknown>, context);
    }

    return this.runPromise(operation, fn as () => Promise<T>, context);
  }

  private async runPromise<T>(
    operation: string,
    fn: () => Promise<T>,
    context: GoogleErrorContext = {},
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw mapGoogleError(error, { ...context, operation });
    }
  }

  private async *runStream(
    operation: string,
    fn: () => AsyncGenerator<string, void, unknown>,
    context: GoogleErrorContext = {},
  ): AsyncGenerator<string, void, unknown> {
    let streamStarted = false;

    try {
      for await (const chunk of fn()) {
        streamStarted = true;
        yield chunk;
      }
    } catch (error) {
      throw mapGoogleError(error, {
        ...context,
        operation,
        streamInterrupted: streamStarted,
      });
    }
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
