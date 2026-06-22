import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { ApiKey } from "../model/api-key.model";

export class UpdateApiKeyDto extends PartialType(
  OmitType(ApiKey, ["id", "organizationId", "createdAt", "updatedAt"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateApiKeyDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
