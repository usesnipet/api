import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { ProviderCatalogEntryModel, TestConnectionResponseDto } from "@/common/provider";
import { ProviderConfigService } from "@/common/provider/provider-config.service";
import { knowledgeIndex as knowledgeIndexTable, KnowledgeIndexRow } from "@/db/schema/knowledge-index";
import { llmConnection as llmConnectionTable } from "@/db/schema/llm-connection";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreateKnowledgeIndexDto } from "./dto/create-knowledge-index.dto";
import { TestKnowledgeIndexConnectionDto } from "./dto/test-knowledge-index-connection.dto";
import { UpdateKnowledgeIndexDto } from "./dto/update-knowledge-index.dto";
import { KnowledgeIndex } from "./model/knowledge-index.model";
import { IndexProviderFactory } from "./providers/index-provider.factory";
import { IndexProviderRegistry } from "./providers/index-provider.registry";
import { IndexProviderDefinition } from "./providers/index-provider.types";

@Injectable()
export class KnowledgeIndexService extends BaseService {
  constructor(
    private readonly providerConfigService: ProviderConfigService<IndexProviderDefinition>,
    private readonly indexProviderRegistry: IndexProviderRegistry,
    private readonly indexProviderFactory: IndexProviderFactory
  ) {
    super();
  }

  listProviders(): ProviderCatalogEntryModel[] {
    return this.providerConfigService.listCatalog(this.indexProviderRegistry);
  }

  async find(
    filter: FilterOptions<KnowledgeIndex>,
    opts?: ReadOpts
  ): Promise<KnowledgeIndex[]> {
    const rows = await this.db(opts).query.knowledgeIndex.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => this.toModel(row));
  }

  async create(
    dto: CreateKnowledgeIndexDto,
    opts?: CreateOpts
  ): Promise<KnowledgeIndex> {
    if (dto.llmConnectionId) {
      await this.assertLlmConnectionExists(dto.llmConnectionId, opts);
    }

    const config = this.providerConfigService.prepareForStorage(
      this.indexProviderRegistry,
      dto.provider,
      dto.config
    );

    const [row] = await this.db(opts)
      .insert(knowledgeIndexTable)
      .values({
        name: dto.name,
        description: dto.description,
        provider: dto.provider,
        llmConnectionId: dto.llmConnectionId ?? null,
        config,
      })
      .returning();

    return this.toModel(row);
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

    const provider = rest.provider ?? existing.provider;
    if (rest.provider !== undefined) {
      this.providerConfigService.assertKnown(this.indexProviderRegistry, rest.provider);
    }

    const values: Partial<typeof knowledgeIndexTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.description !== undefined) values.description = rest.description;
    if (rest.provider !== undefined) values.provider = rest.provider;
    if (rest.llmConnectionId !== undefined) {
      values.llmConnectionId = rest.llmConnectionId;
    }
    if (rest.config !== undefined) {
      values.config = this.providerConfigService.prepareForStorage(
        this.indexProviderRegistry,
        provider,
        rest.config
      );
    }

    const [row] = await this.db(opts)
      .update(knowledgeIndexTable)
      .set(values)
      .where(eq(knowledgeIndexTable.id, id))
      .returning();

    return this.toModel(row);
  }

  async testConnection(
    dto: TestKnowledgeIndexConnectionDto
  ): Promise<TestConnectionResponseDto> {
    const storedConfig = await this.resolveStoredConfigForConnectionTest(dto);
    const plainConfig = this.providerConfigService.resolvePlainConfigForTest(
      this.indexProviderRegistry,
      dto.provider,
      dto.config,
      storedConfig
    );
    return await this.providerConfigService.testConnection(
      this.indexProviderRegistry,
      this.indexProviderFactory,
      dto.provider,
      plainConfig
    );
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

  private async resolveStoredConfigForConnectionTest(
    dto: TestKnowledgeIndexConnectionDto,
    opts?: ReadOpts
  ): Promise<Record<string, unknown> | undefined> {
    if (!dto.knowledgeIndexId) return undefined;

    const [existing] = await this.db(opts)
      .select()
      .from(knowledgeIndexTable)
      .where(eq(knowledgeIndexTable.id, dto.knowledgeIndexId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(
        `Knowledge index ${dto.knowledgeIndexId} not found`
      );
    }

    if (existing.provider !== dto.provider) return undefined;

    return existing.config;
  }

  private toModel(row: KnowledgeIndexRow): KnowledgeIndex {
    const config = this.providerConfigService.prepareForResponse(
      this.indexProviderRegistry,
      row.provider,
      row.config
    );
    return KnowledgeIndex.fromRow(row, config);
  }
}
