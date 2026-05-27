import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

import { CreateLlmConnectionDto } from "./create-llm-connection.dto";

export class TestLlmConnectionConnectionDto extends PickType(CreateLlmConnectionDto, [
  "provider",
  "config",
] as const) {
  @ApiPropertyOptional({
    description:
      "When editing, merges omitted encrypted config fields from this LLM connection",
  })
  @IsOptional()
  @IsUUID()
  llmConnectionId?: string;

  constructor(data?: TestLlmConnectionConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
