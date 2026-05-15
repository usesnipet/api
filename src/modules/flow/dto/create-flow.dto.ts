import { OmitType } from "@nestjs/swagger";

import { Flow } from "../model/flow.model";

export class CreateFlowDto extends OmitType(Flow, ["id", "createdAt", "updatedAt", "active"] as const) {
  constructor(data: CreateFlowDto) {
    super();
    if (data) Object.assign(this, data);
  }
}