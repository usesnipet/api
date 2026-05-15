import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

import { BaseManifest } from "./base";

@ObjectType()
export class NodeManifest extends BaseManifest {
  @IsString()
  @Field(() => String)
  type!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  config?: string;
}
