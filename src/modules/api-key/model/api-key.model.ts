import { ApiKeyRow } from "@/db/schema/api-key";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import moment from "moment";

export class ApiKey {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: "sk_live_ab12" })
  @IsString()
  @MaxLength(32)
  keyPrefix!: string;

  @ApiProperty()
  @IsBoolean()
  revoked!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date;

  constructor(data: ApiKey) {
    Object.assign(this, data);
  }

  static fromRow(row: ApiKeyRow): ApiKey {
    return new ApiKey({
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      revoked: row.revoked,
      expiresAt: row.expiresAt ? moment(row.expiresAt).toDate() : undefined,
      lastUsedAt: row.lastUsedAt ? moment(row.lastUsedAt).toDate() : undefined,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
