import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { flow as flowTable } from "@/db/schema/flow";
import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { UpdateFlowDto } from "./dto/update-flow.dto";
import { Flow } from "./model/flow.model";

import type { CreateFlowDto } from "./dto/create-flow.dto";
@Injectable()
export class FlowService extends BaseService {
  constructor() {
    super();
  }

  async find(filter: FilterOptions<Flow>, opts?: ReadOpts): Promise<Flow[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.flow.findMany(drizzleFilter);
    return queryResult.map((row) => Flow.fromRow(row));
  }

  async create(dto: CreateFlowDto[], opts?: CreateOpts): Promise<Flow[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };
      if (dto.length === 0) return [];
      const rows = await this.db(txOpts).insert(flowTable).values(dto).returning();
      return rows.map((row) => Flow.fromRow(row));
    }, opts);
  }

  async update(dto: UpdateFlowDto, opts?: UpdateOpts): Promise<Flow> {
    const { id, ...rest } = dto;
    const [row] = await this.db(opts)
      .update(flowTable)
      .set(rest)
      .where(eq(flowTable.id, id))
      .returning();
    return Flow.fromRow(row);
  }

  delete(id: string, opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(flowTable).where(eq(flowTable.id, id));
    }, opts);
  }
}