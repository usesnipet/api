import { OmitType } from "@nestjs/swagger";

import { KnowledgeSource } from "../model/knowledge-source.model";

export class CreateKnowledgeSourceDto extends OmitType(KnowledgeSource, [
  "id",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreateKnowledgeSourceDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
