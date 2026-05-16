import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { tag } from "@/db/schema/tag";
import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { Tag } from "./model/tag.model";

@Injectable()
export class TagService extends BaseService {
  constructor() {
    super();
  }

  async find(filter: FilterOptions<Tag>, opts?: ReadOpts): Promise<Tag[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.tag.findMany(drizzleFilter);
    return queryResult.map((row) => Tag.fromRow(row));
  }

  async create(dto: CreateTagDto[], opts?: CreateOpts): Promise<Tag[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };
      if (dto.length === 0) return [];
      const rows = await this.db(txOpts).insert(tag).values(dto).returning();
      return rows.map((row) => Tag.fromRow(row));
    }, opts);
  }

  async update(dto: UpdateTagDto, opts?: UpdateOpts): Promise<Tag> {
    const { id, ...rest } = dto;
    const [row] = await this.db(opts).update(tag).set(rest).where(eq(tag.id, id)).returning();
    return Tag.fromRow(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(tag).where(eq(tag.id, id));
    }, opts);
  }
}
