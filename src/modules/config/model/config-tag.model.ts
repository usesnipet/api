import type { ConfigTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/models/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";

export class ConfigTag {
  @ApiProperty()
  @IsUUID()
  configId: string;

  @ApiProperty()
  @IsUUID()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  @IsOptional()
  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  constructor(data: ConfigTag) {
    Object.assign(this, data);
  }

  static fromRow(row: ConfigTagRow): ConfigTag {
    return new ConfigTag({
      configId: row.configId,
      tagId: row.tagId,
      tag: row.tag ? new Tag(row.tag) : undefined,
    });
  }
}
