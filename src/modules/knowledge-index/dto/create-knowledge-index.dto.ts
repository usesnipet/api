import { OmitType } from "@nestjs/swagger";

import { KnowledgeIndex } from "../model/knowledge-index.model";

export class CreateKnowledgeIndexDto extends OmitType(KnowledgeIndex, [
  "id",
  "createdAt",
  "updatedAt",
] as const) {
  constructor(data?: CreateKnowledgeIndexDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
