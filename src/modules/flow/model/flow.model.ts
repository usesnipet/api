import { FlowRow } from "@/db/schema/flow";
import { FlowManifest } from "@/runner";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
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

  @ApiProperty({ type: () => FlowManifest })
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
      description: row.description ?? undefined,
      active: row.active,
      code: FlowManifest.fromManifest(row.code),
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
