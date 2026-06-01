import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { conversation as conversationTable } from "@/db/schema/conversation";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";
import { Conversation } from "./model/conversation.model";

@Injectable()
export class ConversationService extends BaseService {
  async find(
    filter: FilterOptions<Conversation>,
    opts?: ReadOpts
  ): Promise<Conversation[]> {
    const rows = await this.db(opts).query.conversation.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => Conversation.fromRow(row));
  }

  async create(dto: CreateConversationDto, opts?: CreateOpts): Promise<Conversation> {
    const [row] = await this.db(opts)
      .insert(conversationTable)
      .values({
        title: dto.title ?? null,
        metadata: dto.metadata ?? {},
      })
      .returning();

    return Conversation.fromRow(row);
  }

  async update(dto: UpdateConversationDto, opts?: UpdateOpts): Promise<Conversation> {
    const { id, ...rest } = dto;
    const [existing] = await this.db(opts)
      .select()
      .from(conversationTable)
      .where(eq(conversationTable.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    const values: Partial<typeof conversationTable.$inferInsert> = {};

    if (rest.title !== undefined) values.title = rest.title;
    if (rest.metadata !== undefined) values.metadata = rest.metadata;

    const [row] = await this.db(opts)
      .update(conversationTable)
      .set(values)
      .where(eq(conversationTable.id, id))
      .returning();

    return Conversation.fromRow(row);
  }

  async delete(id: string, opts?: DeleteOpts): Promise<void> {
    const result = await this.db(opts)
      .delete(conversationTable)
      .where(eq(conversationTable.id, id))
      .returning({ id: conversationTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }
  }
}
