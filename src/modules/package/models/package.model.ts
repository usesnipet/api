import { Relation } from "@/decorators/relation.decorator";
import type { PackageRow } from "@/db/schema/package";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { PackageTag } from "./package-tag.model";

export class Package {
  @ApiProperty()
  id: string;

  @ApiProperty()
  packageId: string;

  @ApiProperty()
  version: string;

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
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Relation(() => PackageTag)
  @ApiPropertyOptional({ type: [PackageTag] })
  packageTags: PackageTag[];

  constructor(data: PackageRow) {
    Object.assign(this, data);
    this.packageTags = data.packageTags?.map((t) => new PackageTag(t)) ?? [];
  }
}
