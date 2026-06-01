import { OmitType } from "@nestjs/swagger";

import { Conversation } from "../model/conversation.model";

export class CreateConversationDto extends OmitType(Conversation, [
  "id",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreateConversationDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
