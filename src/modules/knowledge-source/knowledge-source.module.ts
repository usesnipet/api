import { Module } from "@nestjs/common";

import { KnowledgeSourceController } from "./knowledge-source.controller";
import { KnowledgeSourceService } from "./knowledge-source.service";
import { SourceProviderFactory } from "./providers/source-provider.factory";
import { SourceProviderRegistry } from "./providers/source-provider.registry";

@Module({
  controllers: [KnowledgeSourceController],
  providers: [
    KnowledgeSourceService,
    SourceProviderRegistry,
    SourceProviderFactory,
  ],
  exports: [KnowledgeSourceService, SourceProviderFactory, SourceProviderRegistry],
})
export class KnowledgeSourceModule {}
