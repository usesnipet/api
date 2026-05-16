import { ApiFilterQueries, Filter } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { ConfigService } from "./config.service";
import { Config } from "./model/config.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("configs")
@Controller("configs")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Config] })
  find(@Filter() filter: FilterOptions<Config>) {
    return this.configService.find(filter);
  }
}
