import { ApiFilterQueries, Filter } from "@/common/filter";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { Tag } from "./model/tag.model";
import { TagService } from "./tag.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("tags")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Tag] })
  find(@Filter(Tag) filter: FilterOptions<Tag>) {
    return this.tagService.find(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: [Tag] })
  create(@Body() dto: CreateTagDto[]): Promise<Tag[]> {
    return this.tagService.create(dto);
  }

  @Put()
  @ApiOkResponse({ type: Tag })
  update(@Body() dto: UpdateTagDto): Promise<Tag> {
    return this.tagService.update(dto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: void 0 })
  delete(@Param("id") id: string): Promise<void> {
    return this.tagService.delete(id);
  }
}
