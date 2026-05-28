import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

import { LLM_MODEL_TYPES, type LlmModelType } from "../providers/llm-model-type";

export class LlmModel {
  @ApiProperty({ example: "gpt-4o" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  modelId!: string;

  @ApiProperty({ enum: LLM_MODEL_TYPES, example: "text" })
  @IsIn(LLM_MODEL_TYPES)
  type!: LlmModelType;

  @ApiPropertyOptional({ example: "GPT-4o" })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  constructor(data: LlmModel) {
    Object.assign(this, data);
  }
}
