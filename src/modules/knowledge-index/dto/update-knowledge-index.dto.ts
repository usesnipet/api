import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { KnowledgeIndex } from "../model/knowledge-index.model";

export class UpdateKnowledgeIndexDto extends PartialType(
  OmitType(KnowledgeIndex, ["id", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateKnowledgeIndexDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
