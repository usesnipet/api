import { Module } from "@nestjs/common";

import { PipelineRunController } from "./pipeline-run.controller";
import { PipelineRunService } from "./pipeline-run.service";

@Module({
  controllers: [PipelineRunController],
  providers: [PipelineRunService],
  exports: [PipelineRunService],
})
export class PipelineRunModule {}
