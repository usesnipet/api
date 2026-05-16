import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { Config } from "../model/config.model";

export class CreateConfigDto extends OmitType(Config, ["id", "configTags", "createdAt", "updatedAt"] as const) {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data?: CreateConfigDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
