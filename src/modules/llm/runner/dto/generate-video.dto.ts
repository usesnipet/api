import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

import { LlmRunBaseDto } from "./llm-run-base.dto";

export class GenerateVideoDto extends LlmRunBaseDto {
  @ApiProperty({ example: "A cat walking in the rain" })
  @IsString()
  @MinLength(1)
  prompt!: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  durationSeconds?: number;
}

export class GenerateVideoResponseDto {
  @ApiProperty()
  modelId!: string;

  @ApiProperty({ enum: ["completed", "processing"] })
  status!: "completed" | "processing";

  @ApiPropertyOptional()
  videoUrl?: string;

  @ApiPropertyOptional()
  jobId?: string;

  constructor(data: GenerateVideoResponseDto) {
    Object.assign(this, data);
  }
}
