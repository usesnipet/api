import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiProperty,
  ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiInternalServerErrorResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiResponse as ApiResponseDecorator, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse
} from "@nestjs/swagger";

export class ApiErrorResponse {
  @ApiProperty({ example: "Validation failed" })
  message!: string;

  @ApiProperty({ example: "Bad Request" })
  error!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}

export type ApiResponseConfig = {
  type?: Type<unknown> | Function | [Type<unknown>] | string;
  description?: string;
  isArray?: boolean;
};

export type ApiResponseMap = Partial<Record<number, ApiResponseConfig | undefined>>;

const DEFAULT_DESCRIPTIONS: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

type SwaggerResponseDecorator = (
  options: ApiResponseConfig,
) => MethodDecorator & ClassDecorator;

const STATUS_DECORATORS: Partial<Record<number, SwaggerResponseDecorator>> = {
  200: (options) => ApiOkResponse(options),
  201: (options) => ApiCreatedResponse(options),
  204: (options) => ApiNoContentResponse(options),
  400: (options) => ApiBadRequestResponse(options),
  401: (options) => ApiUnauthorizedResponse(options),
  403: (options) => ApiForbiddenResponse(options),
  404: (options) => ApiNotFoundResponse(options),
  409: (options) => ApiConflictResponse(options),
  422: (options) => ApiUnprocessableEntityResponse(options),
  500: (options) => ApiInternalServerErrorResponse(options),
};

function isErrorStatus(status: number): boolean {
  return status >= 400;
}

function toSwaggerOptions(status: number, config?: ApiResponseConfig): ApiResponseConfig {
  const defaultType = isErrorStatus(status) ? ApiErrorResponse : undefined;
  return {
    description: DEFAULT_DESCRIPTIONS[status],
    type: defaultType,
    ...config,
  };
}

function decoratorForStatus(status: number, config?: ApiResponseConfig): MethodDecorator & ClassDecorator {
  const options = toSwaggerOptions(status, config);
  const factory = STATUS_DECORATORS[status];
  if (factory) return factory(options);
  return ApiResponseDecorator({ status, ...options });
}

function toResponseMap(first: number | ApiResponseMap, rest: number[]): ApiResponseMap {
  if (typeof first === "number") {
    return Object.fromEntries([first, ...rest].map((code) => [code, undefined]));
  }
  return first;
}

/**
 * Documents HTTP responses for an endpoint in OpenAPI.
 *
 * @example
 * @ApiResponses(200, 400, 401)
 *
 * @example
 * @ApiResponses({
 *   200: { type: [ApiKey] },
 *   400: { description: "Invalid filter query" },
 *   401: { description: "Missing or invalid x-api-key" },
 * })
 */
export function ApiResponses(map: ApiResponseMap): ReturnType<typeof applyDecorators>;
export function ApiResponses(...codes: number[]): ReturnType<typeof applyDecorators>;
export function ApiResponses(
  first: number | ApiResponseMap,
  ...rest: number[]
): ReturnType<typeof applyDecorators> {
  const map = toResponseMap(first, rest);
  const decorators = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .map((status) => decoratorForStatus(status, map[status]));

  return applyDecorators(...decorators);
}
