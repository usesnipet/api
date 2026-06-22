import { ApiResponses, Public } from "@/decorators";
import { User } from "@/decorators/user";
import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateUserDto } from "../user/dto/create-user.dto";

import { AuthService } from "./auth.service";
import { AuthUserDto } from "./dto/auth-user.dto";
import { LoginDto, LoginResponseDto } from "./dto/login.dto";

import type { Response } from "express";
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
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
    this.setTokensToCookies(res, tokens);
    return tokens;
  }

  @Public()
  @Post("register")
  @ApiResponses({
    200: { type: LoginResponseDto },
    400: {},
    401: {},
    500: {},
  })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDto> {
    const tokens = await this.authService.register(dto);
    this.setTokensToCookies(res, tokens);
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

  @Get("me")
  @ApiResponses({
    200: { type: AuthUserDto },
    400: {},
    401: {},
    500: {},
  })
  async me(@User() user: AuthUserDto): Promise<AuthUserDto> {
    return user;
  }

  private setTokensToCookies(res: Response, tokens: LoginResponseDto): void {
    res.cookie(
      "access_token",
      `Bearer ${tokens.accessToken}`,
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
      `Bearer ${tokens.refreshToken}`,
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(Date.now() + tokens.refreshTokenExpiresIn * 1000),
      }
    );
  }

}