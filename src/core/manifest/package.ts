import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsSemVer, IsString, ValidateNested } from "class-validator";

import { BaseManifest } from "./base";
import { ConfigManifest } from "./config";
import { NodeManifest } from "./node";
import { NodeTypeManifest } from "./node-type";

export class PackageManifest extends BaseManifest {
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
