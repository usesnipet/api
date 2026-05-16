import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

import { Config } from "../model/config.model";

export class UpdateConfigDto extends PartialType(
  OmitType(Config, ["id", "configTags", "createdAt", "updatedAt"] as const),
) {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: UpdateConfigDto) {
    super();
    Object.assign(this, data);
  }
}
