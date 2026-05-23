import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { ApiKeyAuthGuard } from "./api-key-auth.guard";
import { ApiKeyController } from "./api-key.controller";
import { ApiKeyService } from "./api-key.service";

@Global()
@Module({
  controllers: [ApiKeyController],
  providers: [
    ApiKeyService,
    ApiKeyAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: ApiKeyAuthGuard,
    },
  ],
  exports: [ApiKeyService, ApiKeyAuthGuard],
})
export class ApiKeyModule {}
