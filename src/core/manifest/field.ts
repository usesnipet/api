import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

export class FieldManifest {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  name!: string;

  @IsString()
  type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  defaultValue?: unknown;

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldManifest)
  items?: FieldManifest;

  @IsOptional()
  @IsRecordOf(FieldManifest)
  properties?: FieldManifest[];

  @IsOptional()
  @IsBoolean()
  encrypted?: boolean;
}
