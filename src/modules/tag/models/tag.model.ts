import type { TagRow } from "@/db/schema/tag";
import { ApiProperty } from "@nestjs/swagger";

export class Tag {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(data: TagRow) {
    Object.assign(this, data);
  }
}
