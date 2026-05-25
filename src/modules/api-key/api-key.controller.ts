import { ApiFilterQueries, Filter } from "@/common/filter";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { ApiKeyCreated } from "./model/api-key-created.model";
import { ApiKey } from "./model/api-key.model";

import type { FilterOptions } from "@/common/filter/filter-options";
import type { Response } from "express";

@ApiTags("api-key")
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
  @ApiNoContentResponse({ description: "API key revoked successfully" })
  async revoke(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.apiKeyService.revoke(id);
    res.status(204).end();
  }

  @Delete(":id")
  @ApiNoContentResponse({ description: "API key deleted successfully" })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.apiKeyService.delete(id);
    res.status(204).end();
  }
}
