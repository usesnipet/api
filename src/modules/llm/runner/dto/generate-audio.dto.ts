import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

import { LlmRunBaseDto } from "./llm-run-base.dto";

export class GenerateAudioDto extends LlmRunBaseDto {
  @ApiPropertyOptional({ example: "Read this aloud" })
  @ValidateIf((dto: GenerateAudioDto) => dto.text === undefined)
  @IsString()
  @MinLength(1)
  prompt?: string;

  @ApiPropertyOptional({ example: "Hello from Snipet" })
  @ValidateIf((dto: GenerateAudioDto) => dto.prompt === undefined)
  @IsString()
  @MinLength(1)
  text?: string;

  @ApiPropertyOptional({ example: "alloy" })
  @IsOptional()
  @IsString()
  voice?: string;
}

export class GenerateAudioResponseDto {
  @ApiProperty()
  modelId!: string;

  @ApiPropertyOptional()
  audioBase64?: string;

  @ApiPropertyOptional()
  audioUrl?: string;

  @ApiPropertyOptional()
  transcript?: string;

  constructor(data: GenerateAudioResponseDto) {
    Object.assign(this, data);
  }
}
