import { ApiFilterQueries, Filter } from "@/common/filter";
import { getAllowedRelationPaths } from "@/decorators";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Node } from "./models/node.model";
import { NodeService } from "./node.service";

import type { FilterOptions } from "@/common/filter/filter-options";
@ApiTags("nodes")
@Controller("nodes")
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Node] })
  find(@Filter({ relations: { allow: getAllowedRelationPaths(Node) }, maxLimit: 1000 }) filter: FilterOptions<Node>) {
    return this.nodeService.find(filter);
  }
}
