import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import type { ConfigManifest } from "@snipet/runner";
import { config, ConfigRow } from "@/db/schema/config";
import { configTag } from "@/db/schema/entity-tags";
import { PackageRow } from "@/db/schema/package";
import { Injectable, Logger } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreateConfigDto } from "./dto/create-config.dto";
import { UpdateConfigDto } from "./dto/update-config.dto";
import { Config } from "./model/config.model";

function insertRowFromDto(rest: Omit<CreateConfigDto, "tags">) {
  return {
    ...rest,
    fieldManifest: rest.fieldManifest ?? [],
  };
}

@Injectable()
export class ConfigService extends BaseService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    super();
  }

  async find(filter: FilterOptions<Config>, opts?: ReadOpts): Promise<Config[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.config.findMany(drizzleFilter);
    return queryResult.map((row) => Config.fromRow(row));
  }

  async create(dto: CreateConfigDto, opts?: CreateOpts): Promise<Config>;
  async create(dto: CreateConfigDto[], opts?: CreateOpts): Promise<Config[]>;
  async create(dto: CreateConfigDto | CreateConfigDto[], opts?: CreateOpts): Promise<Config | Config[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        if (dto.length === 0) return [];
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => insertRowFromDto(rest));
        const entities = await this.db(txOpts).insert(config).values(rowsForInsert).returning();
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities.map((entity) => Config.fromRow(entity));
      }

      const { tags, ...rest } = dto;
      const [entity] = await this.db(txOpts).insert(config).values(insertRowFromDto(rest)).returning();
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return Config.fromRow(entity);
    }, opts);
  }

  async update(dtos: UpdateConfigDto[], opts?: UpdateOpts): Promise<Config[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: UpdateOpts = { ...opts, tx };

      const updated = await Promise.all(
        dtos.map(async (dto) => {
          const { id, ...rest } = dto;
          const patch = Object.fromEntries(
            Object.entries(rest).filter(([key, v]) => key !== "tags" && v !== undefined),
          ) as Omit<UpdateConfigDto, "id" | "tags">;

          const [row] = await this.db(txOpts)
            .update(config)
            .set({ ...(patch as any), updatedAt: new Date() })
            .where(eq(config.id, id))
            .returning();

          if (Object.hasOwn(dto, "tags")) {
            await this.db(txOpts).delete(configTag).where(eq(configTag.configId, id));
            const nextTags = dto.tags ?? [];
            if (nextTags.length > 0) {
              await this.addTags(id, nextTags, txOpts as CreateOpts);
            }
          }

          return Config.fromRow(row);
        }),
      );

      return updated;
    }, opts);
  }

  async delete(ids: string[], opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(config).where(inArray(config.id, ids));
    }, opts);
  }

  //#region Tag related
  private readonly tagsSpec: TagJoinSpec<typeof configTag> = {
    joinTable: configTag,
    ownerIdColumn: configTag.configId,
    ownerIdField: "configId",
  };

  async addTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, configId, tags);
  }

  async removeTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, configId, tags);
  }
  //#endregion

  /**
   * Upserts config definitions from in-process package manifests into the database.
   */
  async syncConfigs(dbPackages: PackageRow[], configManifests: ConfigManifest[]): Promise<ConfigRow[]> {
    const ids = new Set(configManifests.map((c) => c.id));
    const entities = await this.db().query.config.findMany({
      where(fields, { inArray }) {
        return inArray(fields.configId, Array.from(ids));
      },
      with: { configTags: { with: { tag: true } } },
    });

    const { toCreate, toUpdate } = configManifests.reduce(
      (acc, manifest) => {
        const row = entities.find((e) => e.configId === manifest.id);
        if (row) {
          const fieldsChanged =
            JSON.stringify(manifest.fields) !== JSON.stringify(row.fieldManifest);
          if (
            (manifest.name ?? row.name) !== row.name ||
            (manifest.description ?? null) !== row.description ||
            (manifest.docs ?? null) !== row.docs ||
            (manifest.icon ?? null) !== row.icon ||
            fieldsChanged ||
            manifest.tags?.length !== row.configTags.length ||
            manifest.tags?.some((t) => !row.configTags.some((t2) => t2.tag.name === t))
          ) {
            acc.toUpdate.push(
              new UpdateConfigDto({
                id: row.id,
                configId: manifest.id,
                packageId: row.packageId,
                name: manifest.name ?? row.name,
                description: manifest.description ?? row.description ?? null,
                docs: manifest.docs ?? row.docs ?? null,
                icon: manifest.icon ?? row.icon ?? null,
                fieldManifest: manifest.fields,
                tags: manifest.tags,
              }),
            );
          }
        } else {
          const packageEntity = dbPackages.find((p) => p.packageId === manifest.id);
          if (!packageEntity) throw new Error(`Package not found for config ${manifest.id}`);

          acc.toCreate.push(
            new CreateConfigDto({
              configId: manifest.id,
              packageId: packageEntity.id,
              name: manifest.name ?? manifest.id,
              description: manifest.description ?? null,
              docs: manifest.docs ?? null,
              icon: manifest.icon ?? null,
              fieldManifest: manifest.fields ?? [],
              tags: manifest.tags,
            }),
          );
        }
        return acc;
      },
      { toCreate: [] as CreateConfigDto[], toUpdate: [] as UpdateConfigDto[] },
    );
    const toDelete = entities.filter((e) => !ids.has(e.configId));

    if (toCreate.length > 0) {
      this.logger.log(`Creating ${toCreate.length} configs`);
      await this.create(toCreate);
    }
    if (toUpdate.length > 0) {
      this.logger.log(`Updating ${toUpdate.length} configs`);
      await this.update(toUpdate);
    }
    if (toDelete.length > 0) {
      this.logger.log(`Deleting ${toDelete.length} configs`);
      await this.delete(toDelete.map((entity) => entity.id));
    }
    return await this.db().query.config.findMany({ with: { configTags: { with: { tag: true } } } });
  }
}
