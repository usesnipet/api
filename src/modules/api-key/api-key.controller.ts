import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { UpdateApiKeyDto } from "./dto/update-api-key.dto";
import { ApiKey } from "./model/api-key.model";
import { InternalApiKey } from "./model/internal-api-key.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("api-keys")
@Controller("api-keys")
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [ApiKey] },
    400: {},
    401: {},
    500: {},
  })
  find(@Filter(ApiKey) filter: FilterOptions<ApiKey>): Promise<ApiKey[]> {
    return this.apiKeyService.find(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: InternalApiKey },
    400: {},
    401: {},
    404: {},
    500: {},
  })
  create(@Body() dto: CreateApiKeyDto): Promise<InternalApiKey> {
    return this.apiKeyService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: ApiKey },
    400: {},
    401: {},
    404: {},
    500: {},
  })
  update(@Body() dto: UpdateApiKeyDto): Promise<ApiKey> {
    return this.apiKeyService.update(dto);
  }

  @Post(":id/refresh")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: InternalApiKey },
    400: {},
    401: {},
    403: {},
    404: {},
    500: {},
  })
  refreshKey(@Param("id", ParseUUIDPipe) id: string): Promise<InternalApiKey> {
    return this.apiKeyService.refreshKey(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "Api key deleted successfully" },
    400: {},
    401: {},
    404: {},
    500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.apiKeyService.delete(id);
  }
}
