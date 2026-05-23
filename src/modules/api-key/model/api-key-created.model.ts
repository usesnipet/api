import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

import { ApiKey } from "./api-key.model";

export class ApiKeyCreated extends ApiKey {
  @ApiProperty({
    description: "Segredo completo; retornado apenas uma vez na criação",
    example: "sk_live_a1b2c3d4e5f6",
  })
  @IsString()
  key!: string;

  constructor(data: ApiKeyCreated) {
    super(data);
    Object.assign(this, data);
  }
}
