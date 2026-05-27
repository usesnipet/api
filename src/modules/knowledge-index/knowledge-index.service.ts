import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import {
  knowledgeIndex as knowledgeIndexTable,
  KnowledgeIndexRow,
} from "@/db/schema/knowledge-index";
import { llmConnection as llmConnectionTable } from "@/db/schema/llm-connection";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreateKnowledgeIndexDto } from "./dto/create-knowledge-index.dto";
import { UpdateKnowledgeIndexDto } from "./dto/update-knowledge-index.dto";
import { KnowledgeIndex } from "./model/knowledge-index.model";

@Injectable()
export class KnowledgeIndexService extends BaseService {
  async find(
    filter: FilterOptions<KnowledgeIndex>,
    opts?: ReadOpts
  ): Promise<KnowledgeIndex[]> {
    const rows = await this.db(opts).query.knowledgeIndex.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => KnowledgeIndex.fromRow(row));
  }

  async create(
    dto: CreateKnowledgeIndexDto,
    opts?: CreateOpts
  ): Promise<KnowledgeIndex> {
    if (dto.llmConnectionId) {
      await this.assertLlmConnectionExists(dto.llmConnectionId, opts);
    }

    const [row] = await this.db(opts)
      .insert(knowledgeIndexTable)
      .values({
        name: dto.name,
        description: dto.description,
        provider: dto.provider,
        llmConnectionId: dto.llmConnectionId ?? null,
        config: dto.config,
      })
      .returning();

    return KnowledgeIndex.fromRow(row);
  }

  async update(
    dto: UpdateKnowledgeIndexDto,
    opts?: UpdateOpts
  ): Promise<KnowledgeIndex> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(knowledgeIndexTable)
      .where(eq(knowledgeIndexTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Knowledge index ${id} not found`);
    }

    if (rest.llmConnectionId !== undefined && rest.llmConnectionId !== null) {
      await this.assertLlmConnectionExists(rest.llmConnectionId, opts);
    }

    const values: Partial<typeof knowledgeIndexTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.description !== undefined) values.description = rest.description;
    if (rest.provider !== undefined) values.provider = rest.provider;
    if (rest.llmConnectionId !== undefined) {
      values.llmConnectionId = rest.llmConnectionId;
    }
    if (rest.config !== undefined) values.config = rest.config;

    const [row] = await this.db(opts)
      .update(knowledgeIndexTable)
      .set(values)
      .where(eq(knowledgeIndexTable.id, id))
      .returning();

    return KnowledgeIndex.fromRow(row as KnowledgeIndexRow);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(knowledgeIndexTable)
      .where(eq(knowledgeIndexTable.id, id))
      .returning({ id: knowledgeIndexTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Knowledge index ${id} not found`);
    }
  }

  private async assertLlmConnectionExists(
    llmConnectionId: string,
    opts?: ReadOpts
  ): Promise<void> {
    const [row] = await this.db(opts)
      .select({ id: llmConnectionTable.id })
      .from(llmConnectionTable)
      .where(eq(llmConnectionTable.id, llmConnectionId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`LLM connection ${llmConnectionId} not found`);
    }
  }
}
