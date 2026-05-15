import type { NodeTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/models/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class NodeTag {
  @ApiProperty()
  nodeId: string;

  @ApiProperty()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  tag?: Tag;

  constructor(data: NodeTagRow) {
    Object.assign(this, data);
    this.tag = data.tag ? new Tag(data.tag) : undefined;
  }
}
