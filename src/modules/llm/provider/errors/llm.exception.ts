import { LlmErrorCode } from "./llm-error-code";

import type { LlmErrorDetails } from "./llm-error.types";

export class LlmException extends Error {
  readonly code: LlmErrorCode;
  readonly details?: LlmErrorDetails;
  readonly cause?: unknown;

  constructor(
    code: LlmErrorCode,
    message: string,
    details?: LlmErrorDetails,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "LlmException";
    this.code = code;
    this.details = details;
    this.cause = options?.cause;
  }
}