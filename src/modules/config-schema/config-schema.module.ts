import { Global, Module } from "@nestjs/common";

import { ConfigSchemaService } from "./config-schema.service";

@Global()
@Module({
  providers: [ConfigSchemaService],
  exports: [ConfigSchemaService],
})
export class ConfigSchemaModule {}
