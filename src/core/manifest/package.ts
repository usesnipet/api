import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsSemVer, IsString, ValidateNested } from "class-validator";

import { ConfigManifest } from "./config";
import { NodeManifest } from "./node";
import { NodeTypeManifest } from "./node-type";

export class PackageManifest {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ type: [NodeTypeManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeManifest)
  nodeTypes!: NodeTypeManifest[];

  @ApiProperty({ type: [ConfigManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigManifest)
  configs!: ConfigManifest[];

  @ApiProperty({ type: [NodeManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeManifest)
  nodes!: NodeManifest[];

  @ApiProperty({ example: "1.0.0" })
  @IsString()
  @IsSemVer({ message: "Version must be a valid semver" })
  version!: string;
}
