import type { ApiResponseMap } from "@/decorators/api-responses";

import { LlmErrorResponse } from "./llm-error-response.dto";

/** OpenAPI error statuses produced by {@link LlmExceptionFilter}. */
export const LLM_ERROR_RESPONSES: ApiResponseMap = {
  400: { type: LlmErrorResponse },
  404: { type: LlmErrorResponse },
  422: { type: LlmErrorResponse },
  429: { type: LlmErrorResponse },
  502: { type: LlmErrorResponse },
  503: { type: LlmErrorResponse },
  504: { type: LlmErrorResponse },
};
