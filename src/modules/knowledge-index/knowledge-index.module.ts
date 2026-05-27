import { Module } from "@nestjs/common";

import { KnowledgeIndexController } from "./knowledge-index.controller";
import { KnowledgeIndexService } from "./knowledge-index.service";
import { IndexProviderFactory } from "./providers/index-provider.factory";
import { IndexProviderRegistry } from "./providers/index-provider.registry";

@Module({
  controllers: [KnowledgeIndexController],
  providers: [
    KnowledgeIndexService,
    IndexProviderRegistry,
    IndexProviderFactory,
  ],
  exports: [KnowledgeIndexService],
})
export class KnowledgeIndexModule {}
