import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { apiKey as apiKeyTable } from "@/db/schema/api-key";
import { organization as organizationTable } from "@/db/schema/organization";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { generateApiKey } from "./api-key.util";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { UpdateApiKeyDto } from "./dto/update-api-key.dto";
import { ApiKey } from "./model/api-key.model";
import { InternalApiKey } from "./model/internal-api-key.model";

@Injectable()
export class ApiKeyService extends BaseService {
  async find(filter: FilterOptions<ApiKey>, opts?: ReadOpts): Promise<ApiKey[]> {
    const rows = await this.db(opts).query.apiKey.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => ApiKey.fromRow(row));
  }

  async create(dto: CreateApiKeyDto, opts?: CreateOpts): Promise<InternalApiKey> {
    this.assertExpiresAtInFuture(dto.expiresAt);
    await this.assertOrganizationExists(dto.organizationId, opts);

    const [row] = await this.db(opts)
      .insert(apiKeyTable)
      .values({
        organizationId: dto.organizationId,
        name: dto.name,
        key: generateApiKey(),
        expiresAt: dto.expiresAt ?? null,
      })
      .returning();

    return InternalApiKey.fromRow(row);
  }

  async update(dto: UpdateApiKeyDto, opts?: UpdateOpts): Promise<ApiKey> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(apiKeyTable)
      .where(eq(apiKeyTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Api key ${id} not found`);
    }

    if (rest.expiresAt !== undefined) {
      this.assertExpiresAtInFuture(rest.expiresAt);
    }

    const values: Partial<typeof apiKeyTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;
    if (rest.expiresAt !== undefined) values.expiresAt = rest.expiresAt;
    if (rest.enabled !== undefined) values.enabled = rest.enabled;

    const [row] = await this.db(opts)
      .update(apiKeyTable)
      .set(values)
      .where(eq(apiKeyTable.id, id))
      .returning();

    return ApiKey.fromRow(row);
  }

  async refreshKey(id: string, opts?: UpdateOpts): Promise<InternalApiKey> {
    const [existing] = await this.db(opts)
      .select()
      .from(apiKeyTable)
      .where(eq(apiKeyTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Api key ${id} not found`);
    }

    const [row] = await this.db(opts)
      .update(apiKeyTable)
      .set({ key: generateApiKey() })
      .where(eq(apiKeyTable.id, id))
      .returning();

    return InternalApiKey.fromRow(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(apiKeyTable)
      .where(eq(apiKeyTable.id, id))
      .returning({ id: apiKeyTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Api key ${id} not found`);
    }
  }

  private assertExpiresAtInFuture(expiresAt?: Date | null): void {
    if (expiresAt == null) return;

    if (expiresAt <= new Date()) {
      throw new BadRequestException("expiresAt must be in the future");
    }
  }

  private async assertOrganizationExists(
    organizationId: string,
    opts?: ReadOpts
  ): Promise<void> {
    const [organization] = await this.db(opts)
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .where(eq(organizationTable.id, organizationId))
      .limit(1);

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
  }
}
