import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class MetadataManifest {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;
}

export class BaseManifest {
  @ApiPropertyOptional({ type: MetadataManifest })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataManifest)
  metadata: MetadataManifest;

  @ApiProperty()
  @IsString()
  id!: string;
}
