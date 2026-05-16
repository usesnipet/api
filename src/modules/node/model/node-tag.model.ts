import type { NodeTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/model/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";

export class NodeTag {
  @ApiProperty()
  @IsUUID()
  nodeId: string;

  @ApiProperty()
  @IsUUID()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  @IsOptional()
  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  constructor(data: NodeTag) {
    Object.assign(this, data);
  }

  static fromRow(row: NodeTagRow): NodeTag {
    return new NodeTag({
      nodeId: row.nodeId,
      tagId: row.tagId,
      tag: row.tag ? new Tag(row.tag) : undefined,
    });
  }
}
