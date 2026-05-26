import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateKnowledgeSourceDto } from "./dto/create-knowledge-source.dto";
import { UpdateKnowledgeSourceDto } from "./dto/update-knowledge-source.dto";
import { KnowledgeSourceService } from "./knowledge-source.service";
import { KnowledgeSource } from "./model/knowledge-source.model";
import { ProviderCatalogEntryModel } from "./model/provider-catalog-entry.model";

import type { FilterOptions } from "@/common/filter/filter-options";
import type { Response } from "express";
@ApiTags("knowledge-source")
@Controller("knowledge-source")
export class KnowledgeSourceController {
  constructor(private readonly knowledgeSourceService: KnowledgeSourceService) {}

  @Get("providers")
  @ApiResponses({
    200: { type: [ProviderCatalogEntryModel] },
    400: {}, 401: {}, 500: {},
  })
  listProviders(): ProviderCatalogEntryModel[] {
    return this.knowledgeSourceService.listProviders();
  }

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [KnowledgeSource] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(KnowledgeSource) filter: FilterOptions<KnowledgeSource>): Promise<KnowledgeSource[]> {
    return this.knowledgeSourceService.find(filter);
  }

  @Post()
  @ApiResponses({
    201: { type: KnowledgeSource },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreateKnowledgeSourceDto): Promise<KnowledgeSource> {
    return this.knowledgeSourceService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: KnowledgeSource },
    400: {}, 401: {}, 500: {},
  })
  update(@Body() dto: UpdateKnowledgeSourceDto): Promise<KnowledgeSource> {
    return this.knowledgeSourceService.update(dto);
  }

  @Delete(":id")
  @ApiResponses({
    204: { description: "Knowledge source deleted successfully" },
    400: {}, 401: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.knowledgeSourceService.delete(id);
    res.status(204).end();
  }
}
