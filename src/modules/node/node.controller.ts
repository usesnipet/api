import { ApiFilterQueries, Filter } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Node } from "./model/node.model";
import { NodeService } from "./node.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("nodes")
@Controller("nodes")
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Node] })
  find(@Filter() filter: FilterOptions<Node>) {
    return this.nodeService.find(filter);
  }
}
