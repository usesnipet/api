import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { Conversation } from "../model/conversation.model";

export class UpdateConversationDto extends PartialType(
  OmitType(Conversation, ["id", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateConversationDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
