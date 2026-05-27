import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsUUID } from "class-validator";

import { CreateKnowledgeSourceDto } from "./create-knowledge-source.dto";

export class TestKnowledgeSourceConnectionDto extends PickType(
  CreateKnowledgeSourceDto,
  ["provider", "config"] as const
) {
  @ApiPropertyOptional({
    description:
      "When editing, merges omitted encrypted config fields from this knowledge source",
  })
  @IsOptional()
  @IsUUID()
  knowledgeSourceId?: string;

  constructor(data?: TestKnowledgeSourceConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}

export class TestKnowledgeSourceConnectionResponseDto {
  @ApiProperty()
  @IsNumber()
  duration!: number;

  constructor(duration: number) {
    this.duration = duration;
  }
}