import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

import { LLMModelCapabilities } from "../../provider/llm-model-type";

export class ListLlmModelsQueryDto {
  @ApiPropertyOptional({ enum: LLMModelCapabilities })
  @IsOptional()
  @IsEnum(LLMModelCapabilities)
  capability?: LLMModelCapabilities;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  take?: number;
}
