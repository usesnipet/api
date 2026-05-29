import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

import { LLMModelCapabilities } from "../providers/llm-model-type";

export class LlmModel {
  @ApiProperty({ example: "gpt-4o" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  modelId!: string;

  @ApiProperty({ enum: LLMModelCapabilities, isArray: true, example: "text" })
  @IsEnum(LLMModelCapabilities, { each: true })
  capabilities!: LLMModelCapabilities[];

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
