import { applyDecorators, SetMetadata } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

export const IS_PUBLIC_KEY = "isPublic";

/** Opt out of global API key authentication (guard). */
export const Public = () =>
  applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), ApiOperation({ security: [] }));
