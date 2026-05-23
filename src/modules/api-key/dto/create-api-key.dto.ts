import { PickType } from "@nestjs/swagger";

import { ApiKey } from "../model/api-key.model";

export class CreateApiKeyDto extends PickType(ApiKey, [
 "name",
 "expiresAt"
] as const) {
  constructor(data?: CreateApiKeyDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
