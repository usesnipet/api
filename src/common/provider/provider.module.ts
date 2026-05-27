import { DynamicModule, Global } from "@nestjs/common";

import { ProviderConfigService } from "./provider-config.service";

@Global()
export class ProviderModule {
  static forRoot(): DynamicModule {
    return {
      module: ProviderModule,
      providers: [ProviderConfigService],
      exports: [ProviderConfigService],
    };
  }
}