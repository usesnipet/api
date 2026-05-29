import { LlmErrorCode, LlmException } from "../../errors";

const PROVIDER = "llm-google";

export interface GoogleErrorContext {
  modelId?: string;
  operation?: string;
  streamInterrupted?: boolean;
}

interface GoogleApiErrorLike {
  name: string;
  message: string;
  status: number;
}

interface ParsedGoogleErrorBody {
  status?: string;
  code?: number;
  message?: string;
}

export function mapGoogleError(
  error: unknown,
  context: GoogleErrorContext = {},
): LlmException {
  if (error instanceof LlmException) {
    return error;
  }

  const details = {
    provider: PROVIDER,
    ...context,
  };

  let mapped: LlmException;

  if (isGoogleApiError(error)) {
    mapped = mapGoogleApiError(error, details);
  } else if (isNetworkError(error)) {
    mapped = new LlmException(
      LlmErrorCode.PROVIDER_UNREACHABLE,
      "Google API is unreachable",
      details,
      { cause: error },
    );
  } else {
    mapped = new LlmException(
      LlmErrorCode.UNKNOWN,
      error instanceof Error ? error.message : "Unknown Google provider error",
      details,
      { cause: error },
    );
  }

  if (context.streamInterrupted) {
    return new LlmException(
      LlmErrorCode.STREAM_INTERRUPTED,
      mapped.message,
      { ...mapped.details, streamInterrupted: true },
      { cause: error },
    );
  }

  return mapped;
}

function mapGoogleApiError(
  error: GoogleApiErrorLike,
  details: GoogleErrorContext & { provider: string },
): LlmException {
  const parsed = parseGoogleErrorBody(error.message);
  const code = resolveLlmErrorCode(error.status, parsed);
  const message = parsed?.message ?? error.message;

  return new LlmException(
    code,
    message,
    {
      ...details,
      httpStatus: error.status,
      googleStatus: parsed?.status,
      googleCode: parsed?.code,
    },
    { cause: error },
  );
}

function resolveLlmErrorCode(
  httpStatus: number,
  parsed?: ParsedGoogleErrorBody,
): (typeof LlmErrorCode)[keyof typeof LlmErrorCode] {
  const googleStatus = parsed?.status?.toUpperCase();
  const message = (parsed?.message ?? "").toLowerCase();

  if (googleStatus === "UNAUTHENTICATED" || httpStatus === 401) {
    return LlmErrorCode.PROVIDER_AUTH_FAILED;
  }

  if (googleStatus === "PERMISSION_DENIED" || httpStatus === 403) {
    if (message.includes("billing") || message.includes("quota")) {
      return LlmErrorCode.BILLING_REQUIRED;
    }
    return LlmErrorCode.PROVIDER_AUTH_FAILED;
  }

  if (googleStatus === "NOT_FOUND" || httpStatus === 404) {
    return LlmErrorCode.MODEL_NOT_FOUND;
  }

  if (googleStatus === "RESOURCE_EXHAUSTED" || httpStatus === 429) {
    if (message.includes("quota") || message.includes("exhausted")) {
      return LlmErrorCode.QUOTA_EXCEEDED;
    }
    return LlmErrorCode.RATE_LIMITED;
  }

  if (
    googleStatus === "DEADLINE_EXCEEDED"
    || httpStatus === 408
    || httpStatus === 504
  ) {
    return LlmErrorCode.PROVIDER_TIMEOUT;
  }

  if (googleStatus === "UNAVAILABLE" || httpStatus === 503) {
    return LlmErrorCode.MODEL_UNAVAILABLE;
  }

  if (httpStatus === 502) {
    return LlmErrorCode.PROVIDER_UNREACHABLE;
  }

  if (httpStatus >= 500) {
    return LlmErrorCode.PROVIDER_ERROR;
  }

  if (
    googleStatus === "INVALID_ARGUMENT"
    || googleStatus === "FAILED_PRECONDITION"
    || httpStatus === 400
  ) {
    if (message.includes("token") && message.includes("input")) {
      return LlmErrorCode.INPUT_TOKENS_EXCEEDED;
    }
    if (message.includes("token") && message.includes("output")) {
      return LlmErrorCode.OUTPUT_TOKENS_EXCEEDED;
    }
    if (
      message.includes("safety")
      || message.includes("blocked")
      || message.includes("harm")
    ) {
      return LlmErrorCode.CONTENT_FILTERED;
    }
    return LlmErrorCode.INVALID_REQUEST;
  }

  return LlmErrorCode.UNKNOWN;
}

function parseGoogleErrorBody(message: string): ParsedGoogleErrorBody | undefined {
  try {
    const body = JSON.parse(message) as { error?: ParsedGoogleErrorBody };
    return body.error ?? (body as ParsedGoogleErrorBody);
  } catch {
    return undefined;
  }
}

function isGoogleApiError(error: unknown): error is GoogleApiErrorLike {
  return (
    typeof error === "object"
    && error !== null
    && (error as GoogleApiErrorLike).name === "ApiError"
    && typeof (error as GoogleApiErrorLike).status === "number"
  );
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  return code === "ECONNREFUSED"
    || code === "ENOTFOUND"
    || code === "ETIMEDOUT"
    || code === "ECONNRESET";
}
