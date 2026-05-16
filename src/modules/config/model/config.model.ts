import { FieldManifest } from "@/core/manifest/field";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested
} from "class-validator";
import moment from "moment";

import { ConfigTag } from "./config-tag.model";

import type { ConfigRow } from "@/db/schema/config";
export class Config {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  configId: string;

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
  fieldManifest: FieldManifest[];

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ type: [ConfigTag] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigTag)
  configTags: ConfigTag[];

  constructor(data: Config) {
    Object.assign(this, data);
  }

  static fromRow(row: ConfigRow): Config {
    return new Config({
      id: row.id,
      configId: row.configId,
      packageId: row.packageId,
      name: row.name,
      description: row.description,
      docs: row.docs,
      icon: row.icon,
      fieldManifest: row.fieldManifest ?? [],
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
      configTags: row.configTags?.map((t) => ConfigTag.fromRow(t)) ?? [],
    });
  }
}
