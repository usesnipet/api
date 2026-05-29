import { ApiFilterQueries, Filter } from "@/common/filter";
import { ProviderCatalogEntryModel, TestConnectionResponseDto } from "@/common/provider";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateLlmConnectionDto } from "./dto/create-llm-connection.dto";
import { ListLlmModelsQueryDto } from "./dto/list-llm-models-query.dto";
import { TestLlmConnectionConnectionDto } from "./dto/test-llm-connection-connection.dto";
import { UpdateLlmConnectionDto } from "./dto/update-llm-connection.dto";
import { LlmConnectionService } from "./llm-connection.service";
import { LlmModel } from "../provider/model/llm-model.model";

import { LlmConnection } from "./model/llm-connection.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("llm-connection")
@Controller("llm-connection")
export class LlmConnectionController {
  constructor(private readonly llmConnectionService: LlmConnectionService) {}

  @Get("providers")
  @ApiResponses({
    200: { type: [ProviderCatalogEntryModel] },
    400: {}, 401: {}, 500: {},
  })
  listProviders(): ProviderCatalogEntryModel[] {
    return this.llmConnectionService.listProviders();
  }

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [LlmConnection] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(LlmConnection) filter: FilterOptions<LlmConnection>): Promise<LlmConnection[]> {
    return this.llmConnectionService.find(filter);
  }

  @Get(":id/models")
  @ApiResponses({
    200: { type: [LlmModel] },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  listModels(
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ListLlmModelsQueryDto
  ): Promise<LlmModel[]> {
    return this.llmConnectionService.listModels(id, query);
  }

  @Get(":id/models/:modelId")
  @ApiResponses({
    200: { type: LlmModel },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  getModel(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("modelId") modelId: string
  ): Promise<LlmModel> {
    return this.llmConnectionService.getModel(id, decodeURIComponent(modelId));
  }

  @Post("test-connection")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: TestConnectionResponseDto },
    400: {}, 401: {}, 404: {}, 422: {}, 500: {},
  })
  testConnection(
    @Body() dto: TestLlmConnectionConnectionDto
  ): Promise<TestConnectionResponseDto> {
    return this.llmConnectionService.testConnection(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: LlmConnection },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreateLlmConnectionDto): Promise<LlmConnection> {
    return this.llmConnectionService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: LlmConnection },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  update(@Body() dto: UpdateLlmConnectionDto): Promise<LlmConnection> {
    return this.llmConnectionService.update(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "LLM connection deleted successfully" },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.llmConnectionService.delete(id);
  }
}
