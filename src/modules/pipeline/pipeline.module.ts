import { Module } from "@nestjs/common";

import { PipelineController } from "./pipeline.controller";
import { PipelineService } from "./pipeline.service";
import { PipelineRunModule } from "./run/pipeline-run.module";

@Module({
  imports: [PipelineRunModule],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService, PipelineRunModule],
})
export class PipelineModule {}
