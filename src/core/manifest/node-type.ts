import { JsonObject } from "@/common/graphql/json-object";
import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { BaseManifest } from "./base";
import { FieldManifest } from "./field";

@ObjectType()
export class NodeTypeComponentManifest {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  @Field(() => String)
  name!: string;

  @IsString()
  @Field(() => String)
  type!: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  required?: boolean;
}

@ObjectType()
export class NodeTypeManifest extends BaseManifest {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  @Field(() => [JsonObject], { nullable: true })
  inputs?: FieldManifest[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  @Field(() => [JsonObject], { nullable: true })
  outputs?: FieldManifest[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeComponentManifest)
  @Field(() => [JsonObject], { nullable: true })
  components?: NodeTypeComponentManifest[];
}