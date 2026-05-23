import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiKeyAuth } from "@/decorators/auth";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { ApiKeyCreated } from "./model/api-key-created.model";
import { ApiKey } from "./model/api-key.model";

import type { FilterOptions } from "@/common/filter/filter-options";
@ApiTags("api-key")
@ApiKeyAuth()
@Controller("api-key")
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [ApiKey] })
  find(@Filter(ApiKey) filter: FilterOptions<ApiKey>): Promise<ApiKey[]> {
    return this.apiKeyService.find(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: ApiKeyCreated })
  create(@Body() dto: CreateApiKeyDto): Promise<ApiKeyCreated> {
    return this.apiKeyService.create(dto);
  }

  @Post(":id/revoke")
  revoke(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.apiKeyService.revoke(id);
  }

  @Delete(":id")
  delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.apiKeyService.delete(id);
  }
}
