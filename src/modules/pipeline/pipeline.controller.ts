import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreatePipelineDto } from "./dto/create-pipeline.dto";
import { UpdatePipelineDto } from "./dto/update-pipeline.dto";
import { Pipeline } from "./model/pipeline.model";
import { PipelineService } from "./pipeline.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("pipeline")
@Controller("pipeline")
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [Pipeline] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(Pipeline) filter: FilterOptions<Pipeline>): Promise<Pipeline[]> {
    return this.pipelineService.find(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: Pipeline },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreatePipelineDto): Promise<Pipeline> {
    return this.pipelineService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: Pipeline },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  update(@Body() dto: UpdatePipelineDto): Promise<Pipeline> {
    return this.pipelineService.update(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "Pipeline deleted successfully" },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.pipelineService.delete(id);
  }
}
