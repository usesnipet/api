import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

export class FieldManifest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: unknown;

  @ApiPropertyOptional({ type: () => FieldManifest })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldManifest)
  items?: FieldManifest;

  @ApiPropertyOptional({ type: Object, additionalProperties: true })
  @IsOptional()
  @IsRecordOf(FieldManifest)
  properties?: Record<string, FieldManifest>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  encrypted?: boolean;
}
