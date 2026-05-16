import type { PackageTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/model/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";

export class PackageTag {
  @ApiProperty()
  @IsUUID()
  packageId: string;

  @ApiProperty()
  @IsUUID()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  @IsOptional()
  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  constructor(data: PackageTag) {
    Object.assign(this, data);
  }

  static fromRow(row: PackageTagRow): PackageTag {
    return new PackageTag({
      packageId: row.packageId,
      tagId: row.tagId,
      tag: row.tag ? Tag.fromRow(row.tag) : undefined,
    });
  }
}
