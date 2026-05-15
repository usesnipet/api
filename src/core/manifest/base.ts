import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class MetadataManifest {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  docs?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  author?: string;
}

export class BaseManifest {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataManifest)
  metadata: MetadataManifest;

  @IsString()
  id!: string;
}
