import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

import { NodeType } from "../model/node-type.model";

export class UpdateNodeTypeDto extends PartialType(
  OmitType(NodeType, ["id", "nodeTypeTags", "createdAt", "updatedAt"] as const),
) {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(data: UpdateNodeTypeDto) {
    super();
    Object.assign(this, data);
  }
}
