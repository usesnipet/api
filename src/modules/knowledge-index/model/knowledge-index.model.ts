import { KnowledgeIndexRow } from "@/db/schema/knowledge-index";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import moment from "moment";

export class KnowledgeIndex {
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

  @ApiProperty({ example: "pgvector" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  provider!: string;

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  @IsOptional()
  @IsUUID()
  llmConnectionId!: string | null;

  @ApiProperty({
    type: "object",
    additionalProperties: true,
    description: "Provider config; encrypted fields are masked with asterisks in responses",
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

  constructor(data: KnowledgeIndex) {
    Object.assign(this, data);
  }

  static fromRow(
    row: KnowledgeIndexRow,
    config: Record<string, unknown>
  ): KnowledgeIndex {
    return new KnowledgeIndex({
      id: row.id,
      name: row.name,
      description: row.description,
      provider: row.provider,
      llmConnectionId: row.llmConnectionId ?? null,
      config,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
