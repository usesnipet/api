import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { LlmErrorCode } from "./llm-error-code";

export class LlmErrorDetailsDto {
  @ApiPropertyOptional({ example: "google" })
  provider?: string;

  @ApiPropertyOptional({ example: "gemini-2.0-flash" })
  modelId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  llmConnectionId?: string;

  @ApiPropertyOptional({ example: 8192 })
  limit?: number;

  @ApiPropertyOptional({ example: 12000 })
  requested?: number;

  @ApiPropertyOptional({ example: 30000 })
  retryAfterMs?: number;

  @ApiPropertyOptional({ example: "text" })
  capability?: string;
}

/** HTTP body returned by {@link LlmExceptionFilter} when a route throws {@link LlmException}. */
export class LlmErrorResponse {
  @ApiProperty({ example: 422 })
  statusCode!: number;

  @ApiProperty({ example: "Unprocessable Entity" })
  error!: string;

  @ApiProperty({ example: "Provider authentication failed" })
  message!: string;

  @ApiProperty({ enum: LlmErrorCode, example: LlmErrorCode.PROVIDER_AUTH_FAILED })
  code!: LlmErrorCode;

  @ApiPropertyOptional({ type: LlmErrorDetailsDto })
  details?: LlmErrorDetailsDto;
}
