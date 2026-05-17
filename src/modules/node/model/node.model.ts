import type { NodeRow } from "@/db/schema/node";
import { Config } from "@/modules/config/model/config.model";
import { NodeType } from "@/modules/node-type/model/node-type.model";
import { Package } from "@/modules/package/model/package.model";
import { ApiProperty } from "@nestjs/swagger";
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

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  docs?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty()
  @IsUUID()
  nodeTypeId: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsUUID()
  configId: string | null;

  @ApiProperty({ nullable: true })
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ nullable: true })
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({ type: [NodeTag] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTag)
  nodeTags?: NodeTag[];

  @ApiProperty({ type: Package })
  @IsOptional()
  @ValidateNested()
  @Type(() => Package)
  package?: Package;

  @ApiProperty({ type: NodeType })
  @IsOptional()
  @ValidateNested()
  @Type(() => NodeType)
  nodeType?: NodeType;

  @ApiProperty({ type: Config })
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
      description: row.description ?? undefined,
      docs: row.docs ?? undefined,
      icon: row.icon ?? undefined,
      nodeTypeId: row.nodeTypeId,
      configId: row.configId,
      createdAt: row.createdAt ? moment(row.createdAt).toDate() : undefined,
      updatedAt: row.updatedAt ? moment(row.updatedAt).toDate() : undefined,
      nodeTags: row.nodeTags?.map((t) => NodeTag.fromRow(t)),
      package: row.package ? Package.fromRow(row.package) : undefined,
      nodeType: row.nodeType ? NodeType.fromRow(row.nodeType) : undefined,
      config: row.config ? Config.fromRow(row.config) : undefined,
    });
  }
}
