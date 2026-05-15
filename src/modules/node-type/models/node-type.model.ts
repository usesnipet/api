
import { FieldManifest } from "@/core/manifest/field";
import { NodeTypeComponentManifest } from "@/core/manifest/node-type";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NodeTypeTag } from "./node-type-tag.model";

import type { NodeTypeRow } from "@/db/schema/node-type";
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

  @ApiPropertyOptional({ type: [NodeTypeTag] })
  nodeTypeTags: NodeTypeTag[];

  constructor(data: NodeTypeRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.nodeTypeTags = data.nodeTypeTags?.map((t) => new NodeTypeTag(t)) ?? [];
  }
}
