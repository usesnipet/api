import { Type } from "class-transformer";
import {
  IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";

export class FlowNodeRefManifest {
  @IsString()
  instanceId!: string;

  @IsString()
  nodeId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;
}

export class FlowConnectionOutManifest {
  @IsString()
  instanceId!: string;

  @IsString()
  outputId!: string;
}

export class FlowConnectionInManifest {
  @IsString()
  instanceId!: string;

  @IsString()
  inputId!: string;
}

export class FlowConnectionManifest {
  @ValidateNested()
  @Type(() => FlowConnectionOutManifest)
  source!: FlowConnectionOutManifest;

  @ValidateNested()
  @Type(() => FlowConnectionInManifest)
  target!: FlowConnectionInManifest;

  @IsBoolean()
  active!: boolean;
}

export class FlowManifest extends BaseManifest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRefManifest)
  nodes!: FlowNodeRefManifest[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnectionManifest)
  connections!: FlowConnectionManifest[];

  constructor(flow: FlowManifest) {
    super();
    Object.assign(this, flow);
  }
}
