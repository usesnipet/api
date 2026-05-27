import { Module } from "@nestjs/common";

import { KnowledgeIndexController } from "./knowledge-index.controller";
import { KnowledgeIndexService } from "./knowledge-index.service";

@Module({
  controllers: [KnowledgeIndexController],
  providers: [KnowledgeIndexService],
  exports: [KnowledgeIndexService],
})
export class KnowledgeIndexModule {}
