import { FieldManifest } from "@/core/manifest/field";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ConfigTag } from "./config-tag.model";

import type { ConfigRow } from "@/db/schema/config";
export class Config {
  @ApiProperty()
  id: string;

  @ApiProperty()
  configId: string;

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
  fieldManifest?: FieldManifest[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [ConfigTag] })
  configTags: ConfigTag[];

  constructor(data: ConfigRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.configTags = data.configTags?.map((t) => new ConfigTag(t)) ?? [];
  }
}
