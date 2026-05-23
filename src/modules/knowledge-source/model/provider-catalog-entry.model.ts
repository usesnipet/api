import type { ConfigSchema } from "@/modules/config-schema";
import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString, MaxLength, MinLength } from "class-validator";

export class ProviderCatalogEntryModel {
  @ApiProperty({ example: "s3" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  id!: string;

  @ApiProperty({ example: "S3 / MinIO" })
  @IsString()
  label!: string;

  @ApiProperty({ type: "object", additionalProperties: true })
  @IsObject()
  configSchema!: ConfigSchema;

  constructor(data: ProviderCatalogEntryModel) {
    Object.assign(this, data);
  }
}
