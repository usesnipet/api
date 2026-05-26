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

  @ApiProperty({
    description: "Inline SVG markup for the provider",
    example: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"></svg>",
  })
  @IsString()
  icon!: string;

  @ApiProperty({ type: "object", additionalProperties: true })
  @IsObject()
  configSchema!: ConfigSchema;

  constructor(data: ProviderCatalogEntryModel) {
    Object.assign(this, data);
  }
}
