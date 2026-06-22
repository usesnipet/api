import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Organization } from "./model/organization.model";
import { OrganizationService } from "./organization.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("organizations")
@Controller("organizations")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [Organization] },
    400: {},
    401: {},
    500: {},
  })
  find(@Filter(Organization) filter: FilterOptions<Organization>): Promise<Organization[]> {
    return this.organizationService.find(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: Organization },
    400: {},
    401: {},
    409: {},
    500: {},
  })
  create(@Body() dto: CreateOrganizationDto): Promise<Organization> {
    return this.organizationService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: Organization },
    400: {},
    401: {},
    404: {},
    409: {},
    500: {},
  })
  update(@Body() dto: UpdateOrganizationDto): Promise<Organization> {
    return this.organizationService.update(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "Organization deleted successfully" },
    400: {},
    401: {},
    404: {},
    500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.organizationService.delete(id);
  }
}
