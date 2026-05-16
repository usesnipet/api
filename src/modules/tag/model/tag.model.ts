import type { TagRow } from "@/db/schema/tag";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class Tag {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  constructor(data: Tag) {
    Object.assign(this, data);
  }

  static fromRow(row: TagRow): Tag {
    return new Tag({
      id: row.id,
      name: row.name,
    });
  }
}
