import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "john.doe@example.com", format: "email" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", minLength: 8, maxLength: 255 })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: "accessToken" })
  accessToken!: string;

  @ApiProperty({ example: "accessTokenExpiresIn" })
  accessTokenExpiresIn!: number;

  @ApiProperty({ example: "refreshToken" })
  refreshToken!: string;

  @ApiProperty({ example: "refreshTokenExpiresIn" })
  refreshTokenExpiresIn!: number;


  constructor(data: LoginResponseDto) {
    Object.assign(this, data);
  }
}