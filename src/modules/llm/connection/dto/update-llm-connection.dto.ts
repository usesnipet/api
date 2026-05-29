import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { LlmConnection } from "../model/llm-connection.model";

export class UpdateLlmConnectionDto extends PartialType(
  OmitType(LlmConnection, ["id", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateLlmConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
