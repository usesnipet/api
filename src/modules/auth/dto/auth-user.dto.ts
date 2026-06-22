import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, IsUUID } from "class-validator";

import { AccessTokenPayload } from "../types/jwt";

export class AuthUserDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: "john.doe@example.com", format: "email" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "user", enum: ["user", "admin"] })
  @IsString()
  @IsIn(["user", "admin"])
  role!: string;

  constructor(data: AuthUserDto) {
    Object.assign(this, data);
  }

  static fromAccessTokenPayload(payload: AccessTokenPayload): AuthUserDto {
    return new AuthUserDto({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}