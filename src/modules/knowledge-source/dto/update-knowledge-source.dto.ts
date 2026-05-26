import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { KnowledgeSource } from "../model/knowledge-source.model";

/**
 * Before the first sync (no source items), `provider` and `config` may be sent.
 * After sync, only `name` and `description` are accepted; structural fields return 409.
 */
export class UpdateKnowledgeSourceDto extends PartialType(
  OmitType(KnowledgeSource, ["id", "createdAt", "updatedAt", "canEdit"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateKnowledgeSourceDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
