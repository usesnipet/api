import { ApiFilterQueries, Filter } from "@/common/filter";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

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
  @ApiOkResponse({ type: [ProviderCatalogEntryModel] })
  listProviders(): ProviderCatalogEntryModel[] {
    return this.knowledgeSourceService.listProviders();
  }

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [KnowledgeSource] })
  find(@Filter(KnowledgeSource) filter: FilterOptions<KnowledgeSource>): Promise<KnowledgeSource[]> {
    return this.knowledgeSourceService.find(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: KnowledgeSource })
  create(@Body() dto: CreateKnowledgeSourceDto): Promise<KnowledgeSource> {
    return this.knowledgeSourceService.create(dto);
  }

  @Put()
  @ApiOkResponse({ type: KnowledgeSource })
  update(@Body() dto: UpdateKnowledgeSourceDto): Promise<KnowledgeSource> {
    return this.knowledgeSourceService.update(dto);
  }

  @Delete(":id")
  @ApiNoContentResponse({ description: "Knowledge source deleted successfully" })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.knowledgeSourceService.delete(id);
    res.status(204).end();
  }
}
