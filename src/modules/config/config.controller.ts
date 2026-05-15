import { ApiFilterQueries, Filter } from "@/common/filter";
import { getAllowedRelationPaths } from "@/decorators";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { ConfigService } from "./config.service";
import { Config } from "./models/config.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("configs")
@Controller("configs")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Config] })
  find(@Filter({ relations: { allow: getAllowedRelationPaths(Config) }, maxLimit: 1000 }) filter: FilterOptions<Config>) {
    return this.configService.find(filter);
  }
}
