import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MinLength } from "class-validator";

const CHAT_ROLES = ["system", "user", "assistant"] as const;

export class LlmChatMessageDto {
  @ApiProperty({ enum: CHAT_ROLES, example: "user" })
  @IsIn(CHAT_ROLES)
  role!: (typeof CHAT_ROLES)[number];

  @ApiProperty({ example: "Hello" })
  @IsString()
  @MinLength(1)
  content!: string;
}
