import { Relation } from "@/decorators/relation.decorator";
import type { ConfigTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/models/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ConfigTag {
  @ApiProperty()
  configId: string;

  @ApiProperty()
  tagId: string;

  @Relation(() => Tag)
  @ApiPropertyOptional({ type: Tag })
  tag?: Tag;

  constructor(data: ConfigTagRow) {
    Object.assign(this, data);
    this.tag = data.tag ? new Tag(data.tag) : undefined;
  }
}
