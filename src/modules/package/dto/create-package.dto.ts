import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { Package } from "../model/package.model";

export class CreatePackageDto extends OmitType(Package, ["id", "packageTags", "createdAt", "updatedAt"] as const) {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data?: CreatePackageDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
