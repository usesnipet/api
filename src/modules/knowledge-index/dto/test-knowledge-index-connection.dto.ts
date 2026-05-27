import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

import { CreateKnowledgeIndexDto } from "./create-knowledge-index.dto";

export class TestKnowledgeIndexConnectionDto extends PickType(CreateKnowledgeIndexDto, ["provider", "config"] as const) {
  @ApiPropertyOptional({
    description:
      "When editing, merges encrypted config fields from this knowledge index when omitted or sent as asterisk placeholders",
  })
  @IsOptional()
  @IsUUID()
  knowledgeIndexId?: string;

  constructor(data?: TestKnowledgeIndexConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}