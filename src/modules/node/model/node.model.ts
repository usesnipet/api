import type { NodeRow } from "@/db/schema/node";
import { Config } from "@/modules/config/model/config.model";
import { NodeType } from "@/modules/node-type/models/node-type.model";
import { Package } from "@/modules/package/models/package.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested
} from "class-validator";
import moment from "moment";

import { NodeTag } from "./node-tag.model";

export class Node {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  nodeId: string;

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

  @ApiProperty()
  @IsUUID()
  nodeTypeId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  configId: string | null;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ type: [NodeTag] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTag)
  nodeTags: NodeTag[];

  @ApiPropertyOptional({ type: Package })
  @IsOptional()
  @ValidateNested()
  @Type(() => Package)
  package?: Package;

  @ApiPropertyOptional({ type: NodeType })
  @IsOptional()
  @ValidateNested()
  @Type(() => NodeType)
  nodeType?: NodeType;

  @ApiPropertyOptional({ type: Config })
  @IsOptional()
  @ValidateNested()
  @Type(() => Config)
  config?: Config;

  constructor(data: Node) {
    Object.assign(this, data);
  }

  static fromRow(row: NodeRow): Node {
    return new Node({
      id: row.id,
      nodeId: row.nodeId,
      packageId: row.packageId,
      name: row.name,
      description: row.description,
      docs: row.docs,
      icon: row.icon,
      nodeTypeId: row.nodeTypeId,
      configId: row.configId,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
      nodeTags: row.nodeTags?.map((t) => NodeTag.fromRow(t)) ?? [],
      package: row.package,
      nodeType: row.nodeType,
      config: row.config ? Config.fromRow(row.config) : undefined,
    });
  }
}
