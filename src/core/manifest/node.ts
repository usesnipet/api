import { IsOptional, IsString } from "class-validator";

import { BaseManifest } from "./base";

export class NodeManifest extends BaseManifest {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
