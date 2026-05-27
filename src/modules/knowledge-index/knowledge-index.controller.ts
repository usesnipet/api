import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateKnowledgeIndexDto } from "./dto/create-knowledge-index.dto";
import { UpdateKnowledgeIndexDto } from "./dto/update-knowledge-index.dto";
import { KnowledgeIndexService } from "./knowledge-index.service";
import { KnowledgeIndex } from "./model/knowledge-index.model";

import type { FilterOptions } from "@/common/filter/filter-options";
import type { Response } from "express";

@ApiTags("knowledge-index")
@Controller("knowledge-index")
export class KnowledgeIndexController {
  constructor(private readonly knowledgeIndexService: KnowledgeIndexService) {}

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [KnowledgeIndex] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(KnowledgeIndex) filter: FilterOptions<KnowledgeIndex>): Promise<KnowledgeIndex[]> {
    return this.knowledgeIndexService.find(filter);
  }

  @Post()
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
  @ApiResponses({
    204: { description: "Knowledge index deleted successfully" },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.knowledgeIndexService.delete(id);
    res.status(204).end();
  }
}
