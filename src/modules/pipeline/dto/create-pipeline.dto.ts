import { OmitType } from "@nestjs/swagger";

import { Pipeline } from "../model/pipeline.model";

export class CreatePipelineDto extends OmitType(Pipeline, [
  "id",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreatePipelineDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
