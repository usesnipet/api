import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { buildProviderCatalog } from "@/common/provider";
import { knowledgeSource as knowledgeSourceTable, KnowledgeSourceRow } from "@/db/schema/knowledge-source";
import { sourceItem } from "@/db/schema/source-item";
import { ConfigSchemaService } from "@/modules/config-schema";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreateKnowledgeSourceDto } from "./dto/create-knowledge-source.dto";
import { UpdateKnowledgeSourceDto } from "./dto/update-knowledge-source.dto";
import { assertProviderAndConfigMutable } from "./knowledge-source-update.policy";
import { KnowledgeSource } from "./model/knowledge-source.model";
import { ProviderCatalogEntryModel } from "./model/provider-catalog-entry.model";
import { SourceProviderRegistry } from "./providers/source-provider.registry";

@Injectable()
export class KnowledgeSourceService extends BaseService {
  constructor(
    private readonly configSchema: ConfigSchemaService,
    private readonly sourceProviderRegistry: SourceProviderRegistry
  ) {
    super();
  }

  listProviders(): ProviderCatalogEntryModel[] {
    return buildProviderCatalog(this.sourceProviderRegistry).map(
      (entry) => new ProviderCatalogEntryModel(entry)
    );
  }

  async find(
    filter: FilterOptions<KnowledgeSource>,
    opts?: ReadOpts
  ): Promise<KnowledgeSource[]> {
    const rows = await this.db(opts).query.knowledgeSource.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    if (rows.length === 0) return [];

    const lockedIds = await this.knowledgeSourceIdsWithSourceItems(
      rows.map((row) => row.id),
      opts
    );

    return rows.map((row) => {
      const model = this.toModel(row);
      model.canEdit = !lockedIds.has(row.id);
      return model;
    });
  }

  async create(
    dto: CreateKnowledgeSourceDto,
    opts?: CreateOpts
  ): Promise<KnowledgeSource> {
    this.sourceProviderRegistry.assertKnown(dto.provider);
    const definition = this.sourceProviderRegistry.get(dto.provider);
    const storedConfig = this.configSchema.prepareForStorage(
      definition.configSchema,
      dto.config
    );

    const [row] = await this.db(opts).insert(knowledgeSourceTable).values({
      name: dto.name,
      description: dto.description,
      provider: dto.provider,
      config: storedConfig,
    }).returning();

    return this.toModel(row);
  }

  async update(
    dto: UpdateKnowledgeSourceDto,
    opts?: UpdateOpts
  ): Promise<KnowledgeSource> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(knowledgeSourceTable)
      .where(eq(knowledgeSourceTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Knowledge source ${id} not found`);
    }

    const hasSourceItems = await this.hasSourceItems(id, opts);
    assertProviderAndConfigMutable(hasSourceItems, rest);

    const provider = rest.provider ?? existing.provider;
    if (rest.provider !== undefined) {
      this.sourceProviderRegistry.assertKnown(rest.provider);
    }

    const definition = this.sourceProviderRegistry.get(provider);
    const values: Partial<typeof knowledgeSourceTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.description !== undefined) values.description = rest.description;
    if (rest.provider !== undefined) values.provider = rest.provider;
    if (rest.config !== undefined) {
      values.config = this.configSchema.prepareForStorage(
        definition.configSchema,
        rest.config
      );
    }

    const [row] = await this.db(opts)
      .update(knowledgeSourceTable)
      .set(values)
      .where(eq(knowledgeSourceTable.id, id))
      .returning();

    return this.toModel(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(knowledgeSourceTable)
      .where(eq(knowledgeSourceTable.id, id))
      .returning({ id: knowledgeSourceTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Knowledge source ${id} not found`);
    }
  }

  private async hasSourceItems(
    knowledgeSourceId: string,
    opts?: ReadOpts
  ): Promise<boolean> {
    const locked = await this.knowledgeSourceIdsWithSourceItems(
      [knowledgeSourceId],
      opts
    );
    return locked.has(knowledgeSourceId);
  }

  private async knowledgeSourceIdsWithSourceItems(
    knowledgeSourceIds: string[],
    opts?: ReadOpts
  ): Promise<Set<string>> {
    if (knowledgeSourceIds.length === 0) return new Set();

    const rows = await this.db(opts)
      .selectDistinct({ knowledgeSourceId: sourceItem.knowledgeSourceId })
      .from(sourceItem)
      .where(inArray(sourceItem.knowledgeSourceId, knowledgeSourceIds));

    return new Set(rows.map((row) => row.knowledgeSourceId));
  }

  private toModel(row: KnowledgeSourceRow): KnowledgeSource {
    const definition = this.sourceProviderRegistry.get(row.provider);
    const config = this.configSchema.omitEncryptedFields(
      definition.configSchema,
      row.config as Record<string, unknown>
    );
    return KnowledgeSource.fromRow(row, config);
  }
}
