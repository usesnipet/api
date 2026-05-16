import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { NodeType } from "../model/node-type.model";

export class CreateNodeTypeDto extends OmitType(NodeType, ["id", "nodeTypeTags", "createdAt", "updatedAt"] as const) {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: CreateNodeTypeDto) {
    super();
    Object.assign(this, data);
  }
}
