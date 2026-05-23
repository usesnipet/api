import { Module } from "@nestjs/common";

import { ApiKeyAuthGuard } from "./api-key-auth.guard";
import { ApiKeyController } from "./api-key.controller";
import { ApiKeyService } from "./api-key.service";

@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyAuthGuard],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
