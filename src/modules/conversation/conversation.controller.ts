import { ApiFilterQueries, Filter } from "@/common/filter";
import { ApiResponses } from "@/decorators/api-responses";
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";
import { Conversation } from "./model/conversation.model";

import type { FilterOptions } from "@/common/filter/filter-options";

@ApiTags("conversations")
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiFilterQueries()
  @ApiResponses({
    200: { type: [Conversation] },
    400: {}, 401: {}, 500: {},
  })
  find(@Filter(Conversation) filter: FilterOptions<Conversation>): Promise<Conversation[]> {
    return this.conversationService.find(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponses({
    201: { type: Conversation },
    400: {}, 401: {}, 500: {},
  })
  create(@Body() dto: CreateConversationDto): Promise<Conversation> {
    return this.conversationService.create(dto);
  }

  @Put()
  @ApiResponses({
    200: { type: Conversation },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  update(@Body() dto: UpdateConversationDto): Promise<Conversation> {
    return this.conversationService.update(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    204: { description: "Conversation deleted successfully" },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.conversationService.delete(id);
  }
}
