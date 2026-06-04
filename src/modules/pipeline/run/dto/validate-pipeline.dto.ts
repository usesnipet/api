import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ValidatePipelineDto {
  @ApiProperty({
    description: "Pipeline definition as YAML (parsed at run time)",
    example: "steps:\n  - use: llm\n    connectionId: \"{{input.llmConnectionId}}\"",
  })
  @IsString()
  @MinLength(1)
  definition!: string;
}
