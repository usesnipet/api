import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";

export class FlowNodeRefManifest {
  @ApiProperty()
  @IsString()
  instanceId!: string;

  @ApiProperty()
  @IsString()
  nodeId!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiProperty()
  @IsNumber()
  x!: number;

  @ApiProperty()
  @IsNumber()
  y!: number;
}

export class FlowConnectionOutManifest {
  @ApiProperty()
  @IsString()
  instanceId!: string;

  @ApiProperty()
  @IsString()
  outputId!: string;
}

export class FlowConnectionInManifest {
  @ApiProperty()
  @IsString()
  instanceId!: string;

  @ApiProperty()
  @IsString()
  inputId!: string;
}

export class FlowConnectionManifest {
  @ApiProperty({ type: FlowConnectionOutManifest })
  @ValidateNested()
  @Type(() => FlowConnectionOutManifest)
  source!: FlowConnectionOutManifest;

  @ApiProperty({ type: FlowConnectionInManifest })
  @ValidateNested()
  @Type(() => FlowConnectionInManifest)
  target!: FlowConnectionInManifest;

  @ApiProperty()
  @IsBoolean()
  active!: boolean;
}

export class FlowManifest extends BaseManifest {
  @ApiProperty({ type: [FlowNodeRefManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRefManifest)
  nodes!: FlowNodeRefManifest[];

  @ApiProperty({ type: [FlowConnectionManifest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnectionManifest)
  connections!: FlowConnectionManifest[];

  constructor(flow: FlowManifest) {
    super();
    Object.assign(this, flow);
  }
}
