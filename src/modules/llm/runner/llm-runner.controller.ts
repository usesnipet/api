import { ApiResponses } from "@/decorators/api-responses";
import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiProduces, ApiTags } from "@nestjs/swagger";

import { LlmErrorCode, LlmException, LLM_ERROR_RESPONSES } from "../provider/errors";

import { GenerateEmbeddingDto, GenerateEmbeddingResponseDto } from "./dto/generate-embedding.dto";
import { GenerateTextDto, GenerateTextResponseDto } from "./dto/generate-text.dto";
import { StreamTextDto } from "./dto/stream-text.dto";
import { LlmRunnerService } from "./llm-runner.service";

import type { Response } from "express";
@ApiTags("llm-runner")
@Controller("llm-runner")
export class LlmRunnerController {
  constructor(private readonly llmRunnerService: LlmRunnerService) {}

  @Post("text")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: GenerateTextResponseDto },
    401: {}, 500: {},
    ...LLM_ERROR_RESPONSES,
  })
  generateText(@Body() dto: GenerateTextDto): Promise<GenerateTextResponseDto> {
    return this.llmRunnerService.generateText(dto);
  }

  @Post("embedding")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: GenerateEmbeddingResponseDto },
    401: {}, 500: {},
    ...LLM_ERROR_RESPONSES,
  })
  generateEmbedding(@Body() dto: GenerateEmbeddingDto): Promise<GenerateEmbeddingResponseDto> {
    return this.llmRunnerService.generateEmbedding(dto);
  }

  @Post("stream")
  @HttpCode(HttpStatus.OK)
  @ApiProduces("text/event-stream")
  @ApiResponses({
    200: { description: "Server-sent events stream of text deltas" },
    401: {}, 500: {},
    ...LLM_ERROR_RESPONSES,
  })
  async streamText(@Body() dto: StreamTextDto, @Res() res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
      for await (const chunk of this.llmRunnerService.streamText(dto)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      if (!res.headersSent) throw error;
      let llmException = new LlmException(
        LlmErrorCode.UNKNOWN,
        error.message,
        { llmConnectionId: dto.llmConnectionId, modelId: dto.modelId },
        { cause: error },
      );
      if (error instanceof LlmException) llmException = error;
      const payload = {
        code: llmException.code,
        message: llmException.message,
        details: llmException.details,
      };

      res.write(`event: error\ndata: ${JSON.stringify(payload)}\n\n`);
      res.end();
    }
  }
}
