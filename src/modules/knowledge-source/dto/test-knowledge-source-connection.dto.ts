import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

import { CreateKnowledgeSourceDto } from "./create-knowledge-source.dto";

export class TestKnowledgeSourceConnectionDto extends PickType(
  CreateKnowledgeSourceDto,
  ["provider", "config"] as const
) {
  @ApiPropertyOptional({
    description:
      "When editing, merges encrypted config fields from this knowledge source when omitted or sent as asterisk placeholders",
  })
  @IsOptional()
  @IsUUID()
  knowledgeSourceId?: string;

  constructor(data?: TestKnowledgeSourceConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
