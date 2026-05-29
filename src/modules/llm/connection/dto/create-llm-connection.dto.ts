import { OmitType } from "@nestjs/swagger";

import { LlmConnection } from "../model/llm-connection.model";

export class CreateLlmConnectionDto extends OmitType(LlmConnection, [
  "id",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreateLlmConnectionDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
