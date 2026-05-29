import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";

import { httpStatusToPhrase, llmErrorCodeToHttpStatus } from "./llm-error-to-http-status";
import { LlmException } from "./llm.exception";

import type { Response } from "express";

@Catch(LlmException)
export class LlmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LlmExceptionFilter.name);

  catch(exception: LlmException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = llmErrorCodeToHttpStatus(exception.code);

    if (exception.cause !== undefined) {
      this.logger.error(exception.message, exception.cause);
    } else {
      this.logger.error(exception.message);
    }

    response.status(status).json({
      statusCode: status,
      error: httpStatusToPhrase(status),
      message: exception.message,
      code: exception.code,
      details: exception.details,
    });
  }
}
