import { OrganizationRow } from "@/db/schema/organization";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import moment from "moment";

export class Organization {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ example: "acme-corp" })
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug!: string;

  @ApiProperty({ example: "Acme Corp" })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: Organization) {
    Object.assign(this, data);
  }

  static fromRow(row: OrganizationRow): Organization {
    return new Organization({
      id: row.id,
      slug: row.slug,
      name: row.name,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
