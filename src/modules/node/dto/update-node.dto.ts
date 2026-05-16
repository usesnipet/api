import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

import { Node } from "../model/node.model";

export class UpdateNodeDto extends PartialType(
  OmitType(Node, ["id", "nodeTags", "package", "nodeType", "config", "createdAt", "updatedAt"] as const),
) {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: UpdateNodeDto) {
    super();
    Object.assign(this, data);
  }
}
