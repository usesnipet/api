import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { apiKey as apiKeyTable } from "@/db/schema/api-key";
import { env } from "@/env";
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { and, eq, gt, isNull, or } from "drizzle-orm";

import { buildKeyPrefix, generateApiKeySecret, hashKey } from "./api-key.util";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { ApiKeyCreated } from "./model/api-key-created.model";
import { ApiKey } from "./model/api-key.model";

import type { ApiKeyRow } from "@/db/schema/api-key";

const ROOT_KEY_NAME = "root";

@Injectable()
export class ApiKeyService extends BaseService implements OnModuleInit {
  private readonly logger = new Logger(ApiKeyService.name);

  async onModuleInit(): Promise<void> {
    await this.ensureRootKey();
  }

  async find(filter: FilterOptions<ApiKey>, opts?: ReadOpts): Promise<ApiKey[]> {
    const rows = await this.db(opts).query.apiKey.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => ApiKey.fromRow(row));
  }

  async create(dto: CreateApiKeyDto, opts?: CreateOpts): Promise<ApiKeyCreated> {
    const secret = generateApiKeySecret();
    return this.insertKey({ name: dto.name, secret }, opts);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    await this.db(opts).delete(apiKeyTable).where(eq(apiKeyTable.id, id));
  }

  async revoke(id: string, opts?: UpdateOpts): Promise<void> {
    const key = (await this.find({
      where: { id },
    }))[0];

    if (!key) {
      throw new NotFoundException(`API key ${id} not found`);
    }

    if (key.revoked) {
      throw new BadRequestException(`API key ${id} is revoked`);
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new BadRequestException(`API key ${id} has expired`);
    }
    if (key.name === ROOT_KEY_NAME) {
      throw new BadRequestException(`API key ${id} is the root key and cannot be revoked`);
    }

    await this.db(opts)
      .update(apiKeyTable)
      .set({ revoked: true })
      .where(eq(apiKeyTable.id, id));
  }

  async validate(secret: string, opts?: ReadOpts): Promise<ApiKeyRow | null> {
    const keyHash = hashKey(secret);
    const now = new Date();

    const [row] = await this.db(opts)
      .select()
      .from(apiKeyTable)
      .where(
        and(
          eq(apiKeyTable.keyHash, keyHash),
          eq(apiKeyTable.revoked, false),
          or(isNull(apiKeyTable.expiresAt), gt(apiKeyTable.expiresAt, now)),
        ),
      )
      .limit(1);

    if (!row) return null;

    await this.db(opts)
      .update(apiKeyTable)
      .set({ lastUsedAt: now })
      .where(eq(apiKeyTable.id, row.id));

    return row;
  }

  private async ensureRootKey(): Promise<void> {
    const existing = await this.findRootKey();
    if (existing) return;

    if (env.ROOT_API_KEY) {
      await this.insertKey({ name: ROOT_KEY_NAME, secret: env.ROOT_API_KEY });
      this.logger.log("Root API key provisioned from ROOT_API_KEY");
      return;
    }

    if (env.NODE_ENV === "development") {
      const created = await this.insertKey({ name: ROOT_KEY_NAME });
      this.logger.warn(
        `Root API key created for development. Store it securely: ${created.key}`,
      );
    }
  }

  private async findRootKey(opts?: ReadOpts): Promise<ApiKeyRow | undefined> {
    const [row] = await this.db(opts)
      .select()
      .from(apiKeyTable)
      .where(
        and(eq(apiKeyTable.name, ROOT_KEY_NAME), eq(apiKeyTable.revoked, false)),
      )
      .limit(1);
    return row;
  }

  private async insertKey(
    input: { name: string; secret?: string },
    opts?: CreateOpts,
  ): Promise<ApiKeyCreated> {
    const secret = input.secret ?? generateApiKeySecret();

    const [row] = await this.db(opts)
      .insert(apiKeyTable)
      .values({
        name: input.name,
        keyHash: hashKey(secret),
        keyPrefix: buildKeyPrefix(secret),
      })
      .returning();

    return new ApiKeyCreated({
      ...ApiKey.fromRow(row),
      key: secret,
    });
  }
}
