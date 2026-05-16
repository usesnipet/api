import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { Tag } from "../model/tag.model";

export class UpdateTagDto extends PartialType(OmitType(Tag, ["id"] as const)) {
  @ApiProperty()
  @IsUUID()
  id: string;

  constructor(data: UpdateTagDto) {
    super();
    Object.assign(this, data);
  }
}
