import { LlmConnectionRow } from "@/db/schema/llm-connection";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsObject,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import moment from "moment";

export class LlmConnection {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: "openai" })
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
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: LlmConnection) {
    Object.assign(this, data);
  }

  static fromRow(
    row: LlmConnectionRow,
    config: Record<string, unknown>
  ): LlmConnection {
    return new LlmConnection({
      id: row.id,
      name: row.name,
      provider: row.provider,
      config,
      enabled: row.enabled,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
