import type { PackageRow } from "@/db/schema/package";
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

import { PackageTag } from "./package-tag.model";

export class Package {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  packageId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  version: string;

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

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  author: string | null;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ type: [PackageTag] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageTag)
  packageTags: PackageTag[];

  constructor(data: Package) {
    Object.assign(this, data);
  }

  static fromRow(row: PackageRow): Package {
    return new Package({
      id: row.id,
      packageId: row.packageId,
      version: row.version,
      name: row.name,
      description: row.description,
      docs: row.docs,
      icon: row.icon,
      author: row.author,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
      packageTags: row.packageTags?.map((t) => PackageTag.fromRow(t)) ?? [],
    });
  }
}
