import { Tag } from "@/modules/tag/models/tag.model";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import type { PackageTagRow } from "@/db/schema/entity-tags";
export class PackageTag {
  @ApiProperty()
  packageId: string;

  @ApiProperty()
  tagId: string;

  @ApiPropertyOptional({ type: Tag })
  tag?: Tag;

  constructor(data: PackageTagRow) {
    Object.assign(this, data);
    this.tag = data.tag ? new Tag(data.tag) : undefined;
  }
}
