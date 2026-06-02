import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength, ValidateNested
} from "class-validator";

import { LlmChatMessageDto } from "./llm-chat-message.dto";
import { LlmRunBaseDto } from "./llm-run-base.dto";

export class GenerateTextDto extends LlmRunBaseDto {
  @ApiPropertyOptional({
    example: "You are a helpful assistant. Answer the user's question with a short answer."
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  prompt?: string;

  @ApiProperty({ type: [LlmChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LlmChatMessageDto)
  messages!: LlmChatMessageDto[];

  @ApiPropertyOptional({ example: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({ example: 1024 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTokens?: number;
}


class GenerateTextUsageDto {
  @ApiPropertyOptional()
  promptTokens?: number;

  @ApiPropertyOptional()
  completionTokens?: number;

  @ApiPropertyOptional()
  totalTokens?: number;
}

export class GenerateTextResponseDto {
  @ApiProperty()
  modelId!: string;

  @ApiProperty()
  content!: string;

  @ApiPropertyOptional({ type: GenerateTextUsageDto })
  usage?: GenerateTextUsageDto;

  constructor(data: GenerateTextResponseDto) {
    Object.assign(this, data);
  }
}
