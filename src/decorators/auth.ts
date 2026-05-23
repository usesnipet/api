import { ApiKeyAuthGuard } from "@/modules/api-key/api-key-auth.guard";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiSecurity } from "@nestjs/swagger";

export const ApiKeyAuth = () => {
  return applyDecorators(
    ApiSecurity("x-api-key"),
    UseGuards(ApiKeyAuthGuard)
  )
}