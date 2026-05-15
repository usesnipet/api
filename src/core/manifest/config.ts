import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { BaseManifest } from "./base";
import { FieldManifest } from "./field";

export class ConfigManifest extends BaseManifest {
  @ApiPropertyOptional({ type: [FieldManifest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  fields?: FieldManifest[];
}
