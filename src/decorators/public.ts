import { applyDecorators, SetMetadata } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

export const IS_PUBLIC_KEY = "isPublic";

/** Opt-out de autenticação por API key (guard global). */
export const Public = () =>
  applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), ApiOperation({ security: [] }));
