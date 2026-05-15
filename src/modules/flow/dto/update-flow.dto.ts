import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { Flow } from "../model/flow.model";

export class UpdateFlowDto extends PartialType(OmitType(Flow, ["id", "createdAt", "updatedAt"] as const)) {
  @ApiProperty()
  @IsUUID()
  id: string;

  constructor(data: UpdateFlowDto) {
    super();
    if (data) Object.assign(this, data);
  }
}