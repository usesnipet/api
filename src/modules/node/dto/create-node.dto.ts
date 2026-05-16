import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { Node } from "../model/node.model";

export class CreateNodeDto extends OmitType(Node, [
  "id",
  "nodeTags",
  "package",
  "nodeType",
  "config",
  "createdAt",
  "updatedAt",
] as const) {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: CreateNodeDto) {
    super();
    Object.assign(this, data);
  }
}
