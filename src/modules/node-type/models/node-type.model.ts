import { Relation } from "@/decorators/relation.decorator";
import { FieldManifest } from "@/core/manifest/field";
import { NodeTypeComponentManifest } from "@/core/manifest/node-type";
import type { NodeTypeRow } from "@/db/schema/node-type";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NodeTypeTag } from "./node-type-tag.model";

export class NodeType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeId: string;

  @ApiProperty()
  packageId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  docs: string | null;

  @ApiPropertyOptional({ nullable: true })
  icon: string | null;

  @ApiPropertyOptional({ nullable: true })
  author: string | null;

  @ApiPropertyOptional({ type: [FieldManifest] })
  inputs: FieldManifest[];

  @ApiPropertyOptional({ type: [FieldManifest] })
  outputs: FieldManifest[];

  @ApiPropertyOptional({ type: [NodeTypeComponentManifest] })
  components: NodeTypeComponentManifest[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Relation(() => NodeTypeTag)
  @ApiPropertyOptional({ type: [NodeTypeTag] })
  nodeTypeTags: NodeTypeTag[];

  constructor(data: NodeTypeRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.nodeTypeTags = data.nodeTypeTags?.map((t) => new NodeTypeTag(t)) ?? [];
  }
}
