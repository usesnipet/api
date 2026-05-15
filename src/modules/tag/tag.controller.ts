import { ApiFilterQueries, Filter } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Tag } from "./models/tag.model";
import { TagService } from "./tag.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("tags")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Tag] })
  find(@Filter() filter: FilterOptions<Tag>) {
    return this.tagService.find(filter);
  }
}
