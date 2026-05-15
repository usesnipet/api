import { FlowManifest } from "@/core/manifest/flow";
import { FlowRow } from "@/db/schema/flow";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested
} from "class-validator";
import moment from "moment";

export class Flow {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ type: FlowManifest })
  @ValidateNested()
  @Type(() => FlowManifest)
  code: FlowManifest;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  constructor(data: Flow) {
    Object.assign(this, data);
  }

  static fromRow(row: FlowRow): Flow {
    return new Flow({
      id: row.id,
      name: row.name,
      active: row.active,
      code: new FlowManifest(row.code),
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
