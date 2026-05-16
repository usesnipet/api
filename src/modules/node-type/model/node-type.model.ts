import { FieldManifest } from "@/core/manifest/field";
import { NodeTypeComponentManifest } from "@/core/manifest/node-type";
import type { NodeTypeRow } from "@/db/schema/node-type";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
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

  @ApiProperty({ type: [FieldManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  inputs: FieldManifest[];

  @ApiProperty({ type: [FieldManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  outputs: FieldManifest[];

  @ApiProperty({ type: [NodeTypeComponentManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeComponentManifest)
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
      inputs: row.inputs ?? [],
      outputs: row.outputs ?? [],
      components: row.components ?? [],
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
      nodeTypeTags: row.nodeTypeTags?.map((t) => NodeTypeTag.fromRow(t)) ?? [],
    });
  }
}
