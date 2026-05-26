import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

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
  @ApiResponses({
    200: { type: [ApiKey] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(ApiKey) filter: FilterOptions<ApiKey>): Promise<ApiKey[]> {
    return this.apiKeyService.find(filter);
  }

  @Post()
  @ApiResponses({
    201: { type: ApiKeyCreated },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreateApiKeyDto): Promise<ApiKeyCreated> {
    return this.apiKeyService.create(dto);
  }

  @Post(":id/revoke")
  @ApiResponses({
    204: { description: "API key revoked successfully" },
    400: {}, 401: {}, 500: {},
  })
  async revoke(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.apiKeyService.revoke(id);
    res.status(204).end();
  }

  @Delete(":id")
  @ApiResponses({
    204: { description: "API key deleted successfully" },
    400: {}, 401: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.apiKeyService.delete(id);
    res.status(204).end();
  }
}
