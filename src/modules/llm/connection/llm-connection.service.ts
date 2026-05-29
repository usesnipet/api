import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { ProviderCatalogEntryModel, TestConnectionResponseDto } from "@/common/provider";
import { ProviderConfigService } from "@/common/provider/provider-config.service";
import { llmConnection as llmConnectionTable, LlmConnectionRow } from "@/db/schema/llm-connection";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { LlmProviderFactory } from "../provider/llm-provider.factory";
import { LlmListModelsOptions } from "../provider/llm-provider.interface";
import { LlmProviderRegistry } from "../provider/llm-provider.registry";
import { LlmProviderDefinition } from "../provider/llm-provider.types";
import { LlmModel } from "../provider/model/llm-model.model";
import { resolveEnabledLlmConnection } from "../shared/resolve-enabled-llm-provider";

import { CreateLlmConnectionDto } from "./dto/create-llm-connection.dto";
import { TestLlmConnectionConnectionDto } from "./dto/test-llm-connection-connection.dto";
import { UpdateLlmConnectionDto } from "./dto/update-llm-connection.dto";
import { LlmConnection } from "./model/llm-connection.model";

@Injectable()
export class LlmConnectionService extends BaseService {
  constructor(
    private readonly providerConfigService: ProviderConfigService<LlmProviderDefinition>,
    private readonly llmProviderRegistry: LlmProviderRegistry,
    private readonly llmProviderFactory: LlmProviderFactory
  ) {
    super();
  }

  listProviders(): ProviderCatalogEntryModel[] {
    return this.providerConfigService.listCatalog(this.llmProviderRegistry);
  }

  async find(
    filter: FilterOptions<LlmConnection>,
    opts?: ReadOpts
  ): Promise<LlmConnection[]> {
    const rows = await this.db(opts).query.llmConnection.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => this.toModel(row));
  }

  async create(dto: CreateLlmConnectionDto, opts?: CreateOpts): Promise<LlmConnection> {
    const config = this.providerConfigService.prepareForStorage(
      this.llmProviderRegistry,
      dto.provider,
      dto.config
    );

    const [row] = await this.db(opts)
      .insert(llmConnectionTable)
      .values({
        name: dto.name,
        provider: dto.provider,
        config,
        enabled: dto.enabled ?? true,
      })
      .returning();

    return this.toModel(row);
  }

  async update(dto: UpdateLlmConnectionDto, opts?: UpdateOpts): Promise<LlmConnection> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(llmConnectionTable)
      .where(eq(llmConnectionTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`LLM connection ${id} not found`);
    }

    if (rest.provider !== undefined) {
      this.providerConfigService.assertKnown(this.llmProviderRegistry, rest.provider);
    }

    const values: Partial<typeof llmConnectionTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.provider !== undefined) values.provider = rest.provider;
    if (rest.enabled !== undefined) values.enabled = rest.enabled;
    if (rest.config !== undefined) {
      values.config = this.providerConfigService.prepareForUpdate(
        this.llmProviderRegistry,
        rest.provider ?? existing.provider,
        existing.config,
        rest.config
      );
    }

    const [row] = await this.db(opts)
      .update(llmConnectionTable)
      .set(values)
      .where(eq(llmConnectionTable.id, id))
      .returning();

    return this.toModel(row);
  }

  async testConnection(
    dto: TestLlmConnectionConnectionDto
  ): Promise<TestConnectionResponseDto> {
    const storedConfig = await this.resolveStoredConfigForConnectionTest(dto);
    const plainConfig = this.providerConfigService.resolvePlainConfigForTest(
      this.llmProviderRegistry,
      dto.provider,
      dto.config,
      storedConfig
    );
    return await this.providerConfigService.testConnection(
      this.llmProviderRegistry,
      this.llmProviderFactory,
      dto.provider,
      plainConfig
    );
  }

  async listModels(id: string, options?: LlmListModelsOptions): Promise<LlmModel[]> {
    const provider = await this.resolveProvider(id);
    return provider.listModels(options);
  }

  async getModel(id: string, modelId: string): Promise<LlmModel> {
    const provider = await this.resolveProvider(id);
    return provider.getModel(modelId);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(llmConnectionTable)
      .where(eq(llmConnectionTable.id, id))
      .returning({ id: llmConnectionTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`LLM connection ${id} not found`);
    }
  }


  private async resolveProvider(llmConnectionId: string, opts?: ReadOpts) {
    return resolveEnabledLlmConnection(
      this.db(opts),
      llmConnectionId,
      this.llmProviderFactory,
    )
  }


  private async resolveStoredConfigForConnectionTest(
    dto: TestLlmConnectionConnectionDto,
    opts?: ReadOpts
  ): Promise<Record<string, unknown> | undefined> {
    if (!dto.llmConnectionId) return undefined;

    const [existing] = await this.db(opts)
      .select()
      .from(llmConnectionTable)
      .where(eq(llmConnectionTable.id, dto.llmConnectionId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`LLM connection ${dto.llmConnectionId} not found`);
    }

    if (existing.provider !== dto.provider) return undefined;

    return existing.config;
  }

  private toModel(row: LlmConnectionRow): LlmConnection {
    const config = this.providerConfigService.prepareForResponse(
      this.llmProviderRegistry,
      row.provider,
      row.config
    );
    return LlmConnection.fromRow(row, config);
  }
}
