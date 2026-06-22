import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { Organization } from "../model/organization.model";

export class UpdateOrganizationDto extends PartialType(
  PickType(Organization, ["name"] as const)
) {
  @ApiProperty()
  @IsUUID()
  id!: string;

  constructor(data?: UpdateOrganizationDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
