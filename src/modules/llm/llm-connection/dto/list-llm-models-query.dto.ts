import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

import { LLM_MODEL_TYPES, type LlmModelType } from "../providers/llm-model-type";

export class ListLlmModelsQueryDto {
  @ApiPropertyOptional({ enum: LLM_MODEL_TYPES })
  @IsOptional()
  @IsIn(LLM_MODEL_TYPES)
  type?: LlmModelType;
}
