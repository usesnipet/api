import { KnowledgeSourceRow } from "@/db/schema/knowledge-source";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsObject,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import moment from "moment";

export class KnowledgeSource {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ example: "s3" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  provider!: string;

  @ApiProperty({
    type: "object",
    additionalProperties: true,
    description: "Provider config; encrypted fields are omitted in responses",
  })
  @IsObject()
  config!: Record<string, unknown>;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  @ApiProperty({
    description:
      "Whether provider and config can still be changed (false after the first sync). Present on list responses only.",
  })
  canEdit?: boolean;

  constructor(data: KnowledgeSource) {
    Object.assign(this, data);
  }

  static fromRow(
    row: KnowledgeSourceRow,
    config: Record<string, unknown>
  ): KnowledgeSource {
    return new KnowledgeSource({
      id: row.id,
      name: row.name,
      description: row.description,
      provider: row.provider,
      config,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
