import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class RunPipelineDto {
  @ApiProperty({
    description: "Input values used to resolve {{input.*}} placeholders in the pipeline definition",
    example: { message: "Hello", llmConnectionId: "e5f6a7b8-c9d0-1234-efab-567890123456" },
  })
  @IsObject()
  inputs!: Record<string, unknown>;
}
