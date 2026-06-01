import { ConversationRow } from "@/db/schema/conversation";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import moment from "moment";

export class Conversation {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "Arbitrary metadata (e.g. userId, channel)",
    default: {},
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: Conversation) {
    Object.assign(this, data);
  }

  static fromRow(row: ConversationRow): Conversation {
    return new Conversation({
      id: row.id,
      title: row.title,
      metadata: row.metadata,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
