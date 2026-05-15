import { ApiFilterQueries, Filter } from "@/common/filter";
import { getAllowedRelationPaths } from "@/decorators";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

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
  find(@Filter({ relations: { allow: getAllowedRelationPaths(Flow) }, maxLimit: 1000 }) filter: FilterOptions<Flow>) {
    return this.flowService.find(filter);
  }
}
