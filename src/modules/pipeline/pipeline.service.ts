import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { pipeline as pipelineTable } from "@/db/schema/pipeline";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreatePipelineDto } from "./dto/create-pipeline.dto";
import { UpdatePipelineDto } from "./dto/update-pipeline.dto";
import { Pipeline } from "./model/pipeline.model";

@Injectable()
export class PipelineService extends BaseService {
  async find(filter: FilterOptions<Pipeline>, opts?: ReadOpts): Promise<Pipeline[]> {
    const rows = await this.db(opts).query.pipeline.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => Pipeline.fromRow(row));
  }

  async create(dto: CreatePipelineDto, opts?: CreateOpts): Promise<Pipeline> {
    const [row] = await this.db(opts)
      .insert(pipelineTable)
      .values({
        name: dto.name,
        description: dto.description,
        definition: dto.definition,
      })
      .returning();

    return Pipeline.fromRow(row);
  }

  async update(dto: UpdatePipelineDto, opts?: UpdateOpts): Promise<Pipeline> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(pipelineTable)
      .where(eq(pipelineTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }

    const values: Partial<typeof pipelineTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.description !== undefined) values.description = rest.description;
    if (rest.definition !== undefined) values.definition = rest.definition;

    const [row] = await this.db(opts)
      .update(pipelineTable)
      .set(values)
      .where(eq(pipelineTable.id, id))
      .returning();

    return Pipeline.fromRow(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(pipelineTable)
      .where(eq(pipelineTable.id, id))
      .returning({ id: pipelineTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }
  }
}
