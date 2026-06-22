import { OmitType } from "@nestjs/swagger";

import { ApiKey } from "../model/api-key.model";

export class CreateApiKeyDto extends OmitType(ApiKey, [
  "id",
  "enabled",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreateApiKeyDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
