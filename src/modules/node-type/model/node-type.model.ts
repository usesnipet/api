import type { NodeTypeRow } from "@/db/schema/node-type";
import { NodeTypeComponentManifest, NodeTypeInputManifest, NodeTypeOutputManifest } from "@/runner";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested
} from "class-validator";
import moment from "moment";

import { NodeTypeTag } from "./node-type-tag.model";

export class NodeType {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  typeId: string;

  @ApiProperty()
  @IsUUID()
  packageId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  docs: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  icon: string | null;

  @ApiProperty({ type: "array", items: { type: "object", additionalProperties: true } })
  @IsArray()
  inputs: NodeTypeInputManifest[];

  @ApiProperty({ type: "array", items: { type: "object", additionalProperties: true } })
  @IsArray()
  outputs: NodeTypeOutputManifest[];

  @ApiProperty({ type: "array", items: { type: "object", additionalProperties: true } })
  @IsArray()
  components: NodeTypeComponentManifest[];

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ type: [NodeTypeTag] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeTag)
  nodeTypeTags: NodeTypeTag[];

  constructor(data: NodeType) {
    Object.assign(this, data);
  }

  static fromRow(row: NodeTypeRow): NodeType {
    return new NodeType({
      id: row.id,
      typeId: row.typeId,
      packageId: row.packageId,
      name: row.name,
      description: row.description,
      docs: row.docs,
      icon: row.icon,
      inputs: row.inputs?.map((i) => NodeTypeInputManifest.fromManifest(i)) ?? [],
      outputs: row.outputs?.map((o) => NodeTypeOutputManifest.fromManifest(o)) ?? [],
      components: row.components?.map((c) => NodeTypeComponentManifest.fromManifest(c)) ?? [],
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
      nodeTypeTags: row.nodeTypeTags?.map((t) => NodeTypeTag.fromRow(t)) ?? [],
    });
  }
}
