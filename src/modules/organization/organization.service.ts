import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { organization as organizationTable } from "@/db/schema/organization";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Organization } from "./model/organization.model";

@Injectable()
export class OrganizationService extends BaseService {

  async find(filter: FilterOptions<Organization>, opts?: ReadOpts): Promise<Organization[]> {
    const rows = await this.db(opts).query.organization.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => Organization.fromRow(row));
  }

  async create(dto: CreateOrganizationDto, opts?: CreateOpts): Promise<Organization> {
    await this.assertSlugAvailable(dto.slug, opts);

    const [row] = await this.db(opts)
      .insert(organizationTable)
      .values({
        slug: dto.slug,
        name: dto.name,
      })
      .returning();

    return Organization.fromRow(row);
  }

  async update(dto: UpdateOrganizationDto, opts?: UpdateOpts): Promise<Organization> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    const values: Partial<typeof organizationTable.$inferInsert> = {};

    if (rest.name !== undefined) values.name = rest.name;

    const [row] = await this.db(opts)
      .update(organizationTable)
      .set(values)
      .where(eq(organizationTable.id, id))
      .returning();

    return Organization.fromRow(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(organizationTable)
      .where(eq(organizationTable.id, id))
      .returning({ id: organizationTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
  }

  private async assertSlugAvailable(slug: string, opts?: ReadOpts, excludeId?: string): Promise<void> {
    const [existing] = await this.db(opts)
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .where(eq(organizationTable.slug, slug))
      .limit(1);

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Organization slug "${slug}" is already in use`);
    }
  }
}
