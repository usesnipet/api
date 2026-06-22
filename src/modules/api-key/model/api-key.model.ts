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
  @IsUUID()
  organizationId!: string;

  @ApiProperty({ example: "Production", minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date | null;

  @ApiProperty({ default: true, type: Boolean })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ type: Date })
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({ type: Date })
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: ApiKey) {
    Object.assign(this, data);
  }

  static fromRow(row: ApiKeyRow): ApiKey {
    return new ApiKey({
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      expiresAt: row.expiresAt ? moment(row.expiresAt).toDate() : null,
      enabled: row.enabled,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
