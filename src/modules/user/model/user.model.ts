import { UserRow } from "@/db";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsIn, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import moment from "moment";

export class User {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

  @ApiProperty({ example: "user" })
  @IsString()
  @IsIn(["user", "admin"])
  role!: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt!: Date;

  constructor(data: User) {
    Object.assign(this, data);
  }

  static fromRow(row: UserRow): User {
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      createdAt: moment(row.createdAt).toDate(),
      updatedAt: moment(row.updatedAt).toDate(),
    });
  }
}
