import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

import { LlmRunBaseDto } from "./llm-run-base.dto";

export class GenerateEmbeddingDto extends LlmRunBaseDto {
  @ApiProperty({ example: "Snipet knowledge base" })
  @IsString()
  @MinLength(1)
  input!: string;
}


class GenerateEmbeddingUsageModel {
  @ApiPropertyOptional()
  promptTokens?: number;

  @ApiPropertyOptional()
  totalTokens?: number;
}

export class GenerateEmbeddingResponseDto {
  @ApiProperty()
  modelId!: string;

  @ApiProperty({ type: [Number], isArray: true })
  embeddings!: number[][];

  @ApiPropertyOptional({ type: GenerateEmbeddingUsageModel })
  usage?: GenerateEmbeddingUsageModel;

  constructor(data: GenerateEmbeddingResponseDto) {
    Object.assign(this, data);
  }
}
