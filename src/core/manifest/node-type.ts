import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";
import { FieldManifest } from "./field";

export class NodeTypeComponentManifest {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  name!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class NodeTypeManifest extends BaseManifest {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  inputs?: FieldManifest[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  outputs?: FieldManifest[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeComponentManifest)
  components?: NodeTypeComponentManifest[];
}
