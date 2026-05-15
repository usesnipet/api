import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";
import { FieldManifest } from "./field";

export class NodeTypeComponentManifest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class NodeTypeManifest extends BaseManifest {
  @ApiPropertyOptional({ type: [FieldManifest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  inputs?: FieldManifest[];

  @ApiPropertyOptional({ type: [FieldManifest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  outputs?: FieldManifest[];

  @ApiPropertyOptional({ type: [NodeTypeComponentManifest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeComponentManifest)
  components?: NodeTypeComponentManifest[];
}
