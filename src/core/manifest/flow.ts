import { JsonObject } from "@/common/graphql/json-object";
import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";

@ObjectType()
export class FlowNodeRefManifest {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  nodeId!: string;

  @IsOptional()
  @IsObject()
  @Field(() => JsonObject, { nullable: true })
  config?: Record<string, unknown>;

  @IsNumber()
  @Field(() => Number)
  x!: number;

  @IsNumber()
  @Field(() => Number)
  y!: number;
}

@ObjectType()
export class FlowConnectionOutManifest {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  outputId!: string;
}

@ObjectType()
export class FlowConnectionInManifest {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  inputId!: string;
}

@ObjectType()
export class FlowConnectionManifest {
  @ValidateNested()
  @Type(() => FlowConnectionOutManifest)
  @Field(() => FlowConnectionOutManifest)
  source!: FlowConnectionOutManifest;

  @ValidateNested()
  @Type(() => FlowConnectionInManifest)
  @Field(() => FlowConnectionInManifest)
  target!: FlowConnectionInManifest;

  @IsBoolean()
  @Field(() => Boolean)
  active!: boolean;
}

@ObjectType()
export class FlowManifest extends BaseManifest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRefManifest)
  @Field(() => [FlowNodeRefManifest])
  nodes!: FlowNodeRefManifest[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnectionManifest)
  @Field(() => [FlowConnectionManifest])
  connections!: FlowConnectionManifest[];

  constructor(flow: FlowManifest) {
    super();
    Object.assign(this, flow);
  }
}
