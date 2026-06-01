import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { Pipeline } from "../model/pipeline.model";

export class UpdatePipelineDto extends PartialType(
  OmitType(Pipeline, ["id", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdatePipelineDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
