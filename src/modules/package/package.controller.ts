import { ApiFilterQueries, Filter } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Package } from "./model/package.model";
import { PackageService } from "./package.service";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("packages")
@Controller("packages")
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Package] })
  find(@Filter(Package) filter: FilterOptions<Package>) {
    return this.packageService.find(filter);
  }
}
