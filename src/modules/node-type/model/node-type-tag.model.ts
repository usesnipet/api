import type { NodeTypeTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/model/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";

export class NodeTypeTag {
  @ApiProperty()
  @IsUUID()
  nodeTypeId: string;

  @ApiProperty()
  @IsUUID()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  @IsOptional()
  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  constructor(data: NodeTypeTag) {
    Object.assign(this, data);
  }

  static fromRow(row: NodeTypeTagRow): NodeTypeTag {
    return new NodeTypeTag({
      nodeTypeId: row.nodeTypeId,
      tagId: row.tagId,
      tag: row.tag ? Tag.fromRow(row.tag) : undefined,
    });
  }
}
