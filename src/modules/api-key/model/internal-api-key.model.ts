import { ApiKeyRow } from "@/db/schema/api-key";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

import { ApiKey } from "./api-key.model";

export class InternalApiKey extends ApiKey {
  @ApiProperty({ description: "Secret key — only returned on create and refresh" })
  @IsString()
  @MaxLength(255)
  key!: string;

  constructor(data: InternalApiKey) {
    super(data);
    Object.assign(this, data);
  }

  static fromRow(row: ApiKeyRow): InternalApiKey {
    return new InternalApiKey({
      ...ApiKey.fromRow(row),
      key: row.key,
    });
  }
}
