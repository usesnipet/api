import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { FilterOptions } from "../filter-options";
import { Constructable } from "@/types";

import { FilterHttpConfig, HttpFilterConverter } from "./http-filter.converter";

export const Filter = <T extends object>(
  cls: Constructable<T>,
  config: FilterHttpConfig = {},
) =>
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): FilterOptions<T> => {
      const req = ctx.switchToHttp().getRequest();
      const query = (req?.query ?? {}) as Record<string, any>;
      return HttpFilterConverter.fromQuery(cls, query, config);
    },
  )();

