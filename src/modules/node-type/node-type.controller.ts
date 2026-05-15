import { ApiFilterQueries, Filter } from "@/common/filter";
import { getAllowedRelationPaths } from "@/decorators";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { NodeType } from "./models/node-type.model";
import { NodeTypeService } from "./node-type.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("node-types")
@Controller("node-types")
export class NodeTypeController {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeType] })
  find(
    @Filter({ relations: { allow: getAllowedRelationPaths(NodeType) }, maxLimit: 1000 }) filter: FilterOptions<NodeType>,
  ) {
    return this.nodeTypeService.find(filter);
  }
}
