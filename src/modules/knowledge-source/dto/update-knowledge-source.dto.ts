import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { KnowledgeSource } from "../model/knowledge-source.model";

export class UpdateKnowledgeSourceDto extends PartialType(
  OmitType(KnowledgeSource, ["id", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateKnowledgeSourceDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
