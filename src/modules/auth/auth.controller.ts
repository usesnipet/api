import { ApiResponses } from "@/decorators";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { LoginDto, LoginResponseDto } from "./dto/login.dto";

import type { Response } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiResponses({
    200: { type: LoginResponseDto },
    400: {},
    401: {},
    500: {},
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDto> {
    const tokens = await this.authService.login(dto);
    res.cookie(
      "access_token",
      tokens.accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(Date.now() + tokens.accessTokenExpiresIn * 1000),
      }
    );
    res.cookie(
      "refresh_token",
      tokens.refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(Date.now() + tokens.refreshTokenExpiresIn * 1000),
      }
    );

    return tokens;
  }

  @Post("logout")
  @ApiResponses({
    200: {},
    400: {},
    401: {},
    500: {},
  })
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
  }
}