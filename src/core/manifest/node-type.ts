import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

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

export class NodeTypeManifest {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  docs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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
