import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsSemVer, IsString, ValidateNested } from "class-validator";

import { BaseManifest } from "./base";
import { ConfigManifest } from "./config";
import { NodeManifest } from "./node";
import { NodeTypeManifest } from "./node-type";

@ObjectType()
export class PackageManifest extends BaseManifest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeManifest)
  @Field(() => [NodeTypeManifest])
  nodeTypes!: NodeTypeManifest[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigManifest)
  @Field(() => [ConfigManifest])
  configs!: ConfigManifest[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeManifest)
  @Field(() => [NodeManifest])
  nodes!: NodeManifest[];

  @IsString()
  @IsSemVer({ message: "Version must be a valid semver" })
  @Field(() => String)
  version!: string;
}