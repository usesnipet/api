import { OmitType } from "@nestjs/swagger";

import { Tag } from "../model/tag.model";

export class CreateTagDto extends OmitType(Tag, ["id"] as const) {
  constructor(data: CreateTagDto) {
    super();
    Object.assign(this, data);
  }
}
