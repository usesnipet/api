import { HttpStatus } from "@nestjs/common";

import { LlmErrorCode } from "./llm-error-code";

const CODE_TO_HTTP_STATUS: Record<LlmErrorCode, HttpStatus> = {
  [LlmErrorCode.CONNECTION_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [LlmErrorCode.CONNECTION_DISABLED]: HttpStatus.NOT_FOUND,
  [LlmErrorCode.PROVIDER_AUTH_FAILED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.PROVIDER_UNREACHABLE]: HttpStatus.BAD_GATEWAY,
  [LlmErrorCode.MODEL_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [LlmErrorCode.MODEL_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [LlmErrorCode.MODEL_CAPABILITY_MISMATCH]: HttpStatus.BAD_REQUEST,
  [LlmErrorCode.INPUT_TOKENS_EXCEEDED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.OUTPUT_TOKENS_EXCEEDED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.INVALID_REQUEST]: HttpStatus.BAD_REQUEST,
  [LlmErrorCode.CONTENT_FILTERED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.RATE_LIMITED]: HttpStatus.TOO_MANY_REQUESTS,
  [LlmErrorCode.QUOTA_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
  [LlmErrorCode.BILLING_REQUIRED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.CAPABILITY_NOT_SUPPORTED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.STREAM_INTERRUPTED]: HttpStatus.UNPROCESSABLE_ENTITY,
  [LlmErrorCode.PROVIDER_TIMEOUT]: HttpStatus.GATEWAY_TIMEOUT,
  [LlmErrorCode.PROVIDER_ERROR]: HttpStatus.BAD_GATEWAY,
  [LlmErrorCode.UNKNOWN]: HttpStatus.UNPROCESSABLE_ENTITY,
};

const HTTP_STATUS_PHRASES: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: "Bad Request",
  [HttpStatus.NOT_FOUND]: "Not Found",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
  [HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
  [HttpStatus.BAD_GATEWAY]: "Bad Gateway",
  [HttpStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
  [HttpStatus.GATEWAY_TIMEOUT]: "Gateway Timeout",
};

export function llmErrorCodeToHttpStatus(code: LlmErrorCode): HttpStatus {
  return CODE_TO_HTTP_STATUS[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}

export function httpStatusToPhrase(status: HttpStatus): string {
  return HTTP_STATUS_PHRASES[status] ?? "Error";
}
