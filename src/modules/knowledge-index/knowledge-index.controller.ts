import { ApiFilterQueries, Filter } from "@/common/filter";
import { ProviderCatalogEntryModel, TestConnectionResponseDto } from "@/common/provider";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateKnowledgeIndexDto } from "./dto/create-knowledge-index.dto";
import { TestKnowledgeIndexConnectionDto } from "./dto/test-knowledge-index-connection.dto";
import { UpdateKnowledgeIndexDto } from "./dto/update-knowledge-index.dto";
import { KnowledgeIndexService } from "./knowledge-index.service";
import { KnowledgeIndex } from "./model/knowledge-index.model";

import type { FilterOptions } from "@/common/filter/filter-options";
@ApiTags("knowledge-index")
@Controller("knowledge-index")
export class KnowledgeIndexController {
  constructor(private readonly knowledgeIndexService: KnowledgeIndexService) {}

  @Get("providers")
  @ApiResponses({
    200: { type: [ProviderCatalogEntryModel] },
    400: {}, 401: {}, 500: {},
  })
  listProviders(): ProviderCatalogEntryModel[] {
    return this.knowledgeIndexService.listProviders();
  }

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [KnowledgeIndex] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(KnowledgeIndex) filter: FilterOptions<KnowledgeIndex>): Promise<KnowledgeIndex[]> {
    return this.knowledgeIndexService.find(filter);
  }

  @Post("test-connection")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: TestConnectionResponseDto },
    400: {}, 401: {}, 404: {}, 422: {}, 500: {},
  })
  testConnection(
    @Body() dto: TestKnowledgeIndexConnectionDto
  ): Promise<TestConnectionResponseDto> {
    return this.knowledgeIndexService.testConnection(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: KnowledgeIndex },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreateKnowledgeIndexDto): Promise<KnowledgeIndex> {
    return this.knowledgeIndexService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: KnowledgeIndex },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  update(@Body() dto: UpdateKnowledgeIndexDto): Promise<KnowledgeIndex> {
    return this.knowledgeIndexService.update(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "Knowledge index deleted successfully" },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.knowledgeIndexService.delete(id);
  }
}
