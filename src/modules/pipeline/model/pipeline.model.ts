import { PipelineRow } from "@/db/schema/pipeline";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import moment from "moment";

export class Pipeline {
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

  @ApiProperty({
    description: "Pipeline definition as YAML (parsed at run time)",
    example: "steps:\n  - use: conversation\n    action: read",
  })
  @IsString()
  @MinLength(1)
  definition!: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: Pipeline) {
    Object.assign(this, data);
  }

  static fromRow(row: PipelineRow): Pipeline {
    return new Pipeline({
      id: row.id,
      name: row.name,
      description: row.description,
      definition: row.definition,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
