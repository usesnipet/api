import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

import { CreateLlmConnectionDto } from "./create-llm-connection.dto";

export class TestLlmConnectionConnectionDto extends PickType(CreateLlmConnectionDto, [
  "provider",
  "config",
] as const) {
  @ApiPropertyOptional({
    description:
      "When editing, merges encrypted config fields from this LLM connection when omitted or sent as asterisk placeholders",
  })
  @IsOptional()
  @IsUUID()
  llmConnectionId?: string;

  constructor(data?: TestLlmConnectionConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
