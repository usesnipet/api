import { Relation } from "@/common/graphql/relation.decorator";
import { FieldManifest } from "@/core/manifest/field";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ConfigTag } from "./config-tag.model";

import type { ConfigRow } from "@/db/schema/config";

@ObjectType()
export class Config {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  configId: string;

  @Field(() => ID)
  packageId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  docs: string | null;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => String, { nullable: true })
  author: string | null;

  @Field(() => [FieldManifest], { nullable: true })
  fieldManifest?: FieldManifest[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Relation(() => ConfigTag)
  @Field(() => [ConfigTag], { nullable: true })
  configTags: ConfigTag[];

  constructor(data: ConfigRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.configTags = data.configTags?.map((t) => new ConfigTag(t)) ?? [];
  }
}
