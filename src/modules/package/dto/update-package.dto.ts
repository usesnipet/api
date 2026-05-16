import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

import { Package } from "../model/package.model";

export class UpdatePackageDto extends PartialType(
  OmitType(Package, ["id", "packageTags", "createdAt", "updatedAt"] as const),
) {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: UpdatePackageDto) {
    super();
    Object.assign(this, data);
  }
}
