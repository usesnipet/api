import { env } from "@/env";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { User } from "../user/model/user.model";
import { UserService } from "../user/user.service";

import { LoginDto, LoginResponseDto } from "./dto/login.dto";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/jwt";

const { v4: uuid } = require('uuid');

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const [user] = await this.userService.find({ where: { email }, limit: 1 });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const [user] = await this.userService.find({ where: { email: dto.email }, limit: 1 });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessTokenPayload(user);
    const refreshToken = this.generateRefreshTokenPayload(user);

    return new LoginResponseDto({
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
    });
  }

  private generateAccessTokenPayload(user: User): { token: string, expiresIn: number } {
    const token = this.jwtService.sign<AccessTokenPayload>({
      type: "access",
      sub: user.id,
      jti: uuid(),
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + env.JWT_EXPIRATION_TIME,
    }, { expiresIn: env.JWT_EXPIRATION_TIME, secret: env.JWT_SECRET });
    return { token, expiresIn: env.JWT_EXPIRATION_TIME };
  }

  private generateRefreshTokenPayload(user: User): { token: string, expiresIn: number } {
    const token = this.jwtService.sign<RefreshTokenPayload>({
      type: "refresh",
      sub: user.id,
      jti: uuid(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    }, { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION_TIME, secret: env.JWT_REFRESH_TOKEN_SECRET });
    return { token, expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION_TIME };
  }
}
