import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class LlmRunBaseDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  llmConnectionId!: string;

  @ApiProperty({ example: "gpt-4o" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  modelId!: string;
}
