import { ApiFilterQueries, Filter } from "@/common/filter";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreateFlowDto } from "./dto/create-flow.dto";
import { UpdateFlowDto } from "./dto/update-flow.dto";
import { FlowService } from "./flow.service";
import { Flow } from "./model/flow.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("flows")
@Controller("flows")
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Flow] })
  find(@Filter(Flow) filter: FilterOptions<Flow>) {
    return this.flowService.find(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: Flow })
  create(@Body() dto: CreateFlowDto[]): Promise<Flow[]> {
    return this.flowService.create(dto);
  }

  @Put()
  @ApiOkResponse({ type: Flow })
  update(@Body() dto: UpdateFlowDto): Promise<Flow> {
    return this.flowService.update(dto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: void 0 })
  delete(@Param("id") id: string): Promise<void> {
    return this.flowService.delete(id);
  }
}
