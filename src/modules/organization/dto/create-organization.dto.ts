import { PickType } from "@nestjs/swagger";

import { Organization } from "../model/organization.model";

export class CreateOrganizationDto extends PickType(Organization, [
  "name", "slug",
] as const) {
  constructor(data?: CreateOrganizationDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
