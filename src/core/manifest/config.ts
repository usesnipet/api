import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { BaseManifest } from "./base";
import { FieldManifest } from "./field";

@ObjectType()
export class ConfigManifest extends BaseManifest {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  @Field(() => [FieldManifest], { nullable: true })
  fields?: FieldManifest[];
}
