import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { nodeTypeTag } from "@/db/schema/entity-tags";
import { nodeType } from "@/db/schema/node-type";
import { PackageRow } from "@/db/schema/package";
import { NodeTypeInputManifest, NodeTypeOutputManifest, PackageManifest } from "@/runner";
import { Injectable, Logger } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreateNodeTypeDto } from "./dto/create-node-type.dto";
import { UpdateNodeTypeDto } from "./dto/update-node-type.dto";
import { NodeType } from "./model/node-type.model";

@Injectable()
export class NodeTypeService extends BaseService {
  private readonly logger = new Logger(NodeTypeService.name);

  constructor() {
    super();
  }

  async find(filter: FilterOptions<NodeType>, opts?: ReadOpts): Promise<NodeType[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.nodeType.findMany(drizzleFilter);
    return queryResult.map((row) => NodeType.fromRow(row));
  }

  async create(dto: CreateNodeTypeDto, opts?: CreateOpts): Promise<NodeType>;
  async create(dto: CreateNodeTypeDto[], opts?: CreateOpts): Promise<NodeType[]>;
  async create(
    dto: CreateNodeTypeDto | CreateNodeTypeDto[],
    opts?: CreateOpts,
  ): Promise<NodeType | NodeType[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        if (dto.length === 0) return [];
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => rest);
        const entities = await this.db(txOpts).insert(nodeType).values(rowsForInsert).returning();
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities.map((e) => NodeType.fromRow(e));
      }

      const { tags, ...rest } = dto;
      const [entity] = await this.db(txOpts).insert(nodeType).values(rest).returning();
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return NodeType.fromRow(entity);
    }, opts);
  }

  async update(dtos: UpdateNodeTypeDto[], opts?: UpdateOpts): Promise<NodeType[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: UpdateOpts = { ...opts, tx };

      const updated = await Promise.all(
        dtos.map(async (dto) => {
          const { id, ...rest } = dto;
          const patch = Object.fromEntries(
            Object.entries(rest).filter(([key, v]) => key !== "tags" && v !== undefined),
          ) as Omit<UpdateNodeTypeDto, "id" | "tags">;

          const [row] = await this.db(txOpts)
            .update(nodeType)
            .set(patch)
            .where(eq(nodeType.id, id))
            .returning();

          if (Object.hasOwn(dto, "tags")) {
            await this.db(txOpts).delete(nodeTypeTag).where(eq(nodeTypeTag.nodeTypeId, id));
            const nextTags = dto.tags ?? [];
            if (nextTags.length > 0) {
              await this.addTags(id, nextTags, txOpts as CreateOpts);
            }
          }

          return NodeType.fromRow(row);
        }),
      );

      return updated;
    }, opts);
  }

  async delete(ids: string[], opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(nodeType).where(inArray(nodeType.id, ids));
    }, opts);
  }

  //#region Tag related
  private readonly tagsSpec: TagJoinSpec<typeof nodeTypeTag> = {
    joinTable: nodeTypeTag,
    ownerIdColumn: nodeTypeTag.nodeTypeId,
    ownerIdField: "nodeTypeId",
  };

  async addTags(nodeTypeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, nodeTypeId, tags);
  }

  async removeTags(nodeTypeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, nodeTypeId, tags);
  }
  //#endregion

  /**
   * Upserts node types from in-process package manifests into the database.
   * Removes DB rows for synced packages whose `type_id` no longer appears in any manifest.
   */
  async syncNodeTypes(dbPackages: PackageRow[], packages: PackageManifest[]): Promise<NodeType[]> {
    const nodeTypesWithPackageId = packages.map((pkg) => pkg.nodeTypes.map((nt) => ({ ...nt, packageId: pkg.id }))).flat();
    const ntIds = new Set(nodeTypesWithPackageId.map((nt) => nt.id));
    const ntEntities = await this.db().query.nodeType.findMany({
      where(fields, { inArray }) {
        return inArray(fields.typeId, Array.from(ntIds));
      },
      with: { nodeTypeTags: { with: { tag: true } } },
    });

    const { toCreate, toUpdate } = nodeTypesWithPackageId.reduce(
      (acc, schema) => {
        const ntEntity = ntEntities.find((nt) => nt.typeId === schema.id);
        if (ntEntity) {
          if (
            schema.name !== ntEntity.name ||
            (schema.description ?? null) !== (ntEntity.description ?? null) ||
            (schema.docs ?? null) !== (ntEntity.docs ?? null) ||
            (schema.icon ?? null) !== (ntEntity.icon ?? null) ||
            JSON.stringify(schema.inputs ?? []) !== JSON.stringify(ntEntity.inputs ?? []) ||
            JSON.stringify(schema.outputs ?? []) !== JSON.stringify(ntEntity.outputs ?? []) ||
            JSON.stringify(schema.components ?? []) !== JSON.stringify(ntEntity.components ?? []) ||
            (schema.tags?.length ?? 0) !== ntEntity.nodeTypeTags.length ||
            (schema.tags ?? []).some((t) => !ntEntity.nodeTypeTags.some((t2) => t2.tag.name === t))
          ) {
            acc.toUpdate.push(
              new UpdateNodeTypeDto({
                id: ntEntity.id,
                typeId: schema.id,
                packageId: ntEntity.packageId,
                name: schema.name,
                description: schema.description ?? null,
                docs: schema.docs ?? null,
                icon: schema.icon ?? null,
                inputs: schema.inputs?.map((i) => NodeTypeInputManifest.fromManifest(i as NodeTypeInputManifest)) ?? [],
                outputs: schema.outputs?.map((o) => NodeTypeOutputManifest.fromManifest(o as NodeTypeOutputManifest)) ?? [],
                components: schema.components ?? [],
                tags: schema.tags,
              }),
            );
          }
        } else {
          const packageEntity = dbPackages.find((p) => p.packageId === schema.packageId);
          if (!packageEntity) {
            console.log(dbPackages);

            console.log(`Package not found for node type ${schema.id}`);
            throw new Error(`Package not found for node type ${schema.id}`);
          }

          acc.toCreate.push(
            new CreateNodeTypeDto({
              typeId: schema.id,
              packageId: packageEntity.id,
              name: schema.name,
              description: schema.description ?? null,
              inputs: schema.inputs?.map((i) => NodeTypeInputManifest.fromManifest(i as NodeTypeInputManifest)) ?? [],
              outputs: schema.outputs?.map((o) => NodeTypeOutputManifest.fromManifest(o as NodeTypeOutputManifest)) ?? [],
              components: schema.components ?? [],
              docs: schema.docs ?? null,
              icon: schema.icon ?? null,
              tags: schema.tags,
            }),
          );
        }
        return acc;
      },
      { toCreate: [] as CreateNodeTypeDto[], toUpdate: [] as UpdateNodeTypeDto[] },
    );
    const toDelete = ntEntities.filter((nt) => !ntIds.has(nt.typeId));

    if (toCreate.length > 0) {
      this.logger.log(`Creating ${toCreate.length} node types`);
      await this.create(toCreate);
    }
    if (toUpdate.length > 0) {
      this.logger.log(`Updating ${toUpdate.length} node types`);
      await this.update(toUpdate);
    }
    if (toDelete.length > 0) {
      this.logger.log(`Deleting ${toDelete.length} node types`);
      await this.delete(toDelete.map((nt) => nt.id));
    }
    return (await this.db().query.nodeType.findMany({
      where(fields, { inArray }) {
        return inArray(fields.typeId, Array.from(ntIds));
      },
      with: { nodeTypeTags: { with: { tag: true } } },
    })).map((row) => NodeType.fromRow(row));
  }
}
