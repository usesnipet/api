import { Config } from "@/modules/config/models/config.model";
import { NodeType } from "@/modules/node-type/models/node-type.model";
import { Package } from "@/modules/package/models/package.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NodeTag } from "./node-tag.model";

import type { NodeRow } from "@/db/schema/node";
export class Node {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nodeId: string;

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

  @ApiProperty()
  nodeTypeId: string;

  @ApiPropertyOptional({ nullable: true })
  configId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [NodeTag] })
  nodeTags: NodeTag[];

  @ApiPropertyOptional({ type: Package })
  package?: Package;

  @ApiPropertyOptional({ type: NodeType })
  nodeType?: NodeType;

  @ApiPropertyOptional({ type: Config })
  config?: Config;

  constructor(data: NodeRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.nodeTags = data.nodeTags?.map((t) => new NodeTag(t)) ?? [];
  }
}
