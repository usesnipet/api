import { ApiProperty } from "@nestjs/swagger";

import type { PipelineDefinition } from "../../pipeline.schema";

export class RunPipelineResponseDto {
  @ApiProperty({ description: "Pipeline definition with {{input.*}} placeholders resolved" })
  definition!: PipelineDefinition;

  constructor(definition: PipelineDefinition) {
    this.definition = definition;
  }
}
