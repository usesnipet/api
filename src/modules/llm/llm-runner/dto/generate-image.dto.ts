import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

import { LlmRunBaseDto } from "./llm-run-base.dto";

export class GenerateImageDto extends LlmRunBaseDto {
  @ApiProperty({ example: "A cat walking in the rain" })
  @IsString()
  @MinLength(1)
  prompt!: string;
}

export class GenerateImageResponseDto {
  @ApiProperty()
  modelId!: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  constructor(data: GenerateImageResponseDto) {
    Object.assign(this, data);
  }
}
