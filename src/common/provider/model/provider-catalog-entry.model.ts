import type { ConfigSchema } from "@/modules/config-schema";
import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString, MaxLength, MinLength } from "class-validator";

export class ProviderCatalogEntryModel {
  @ApiProperty({ example: "pgvector" })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  id!: string;

  @ApiProperty({ example: "PostgreSQL (pgvector)" })
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
    this.id = data.id;
    this.label = data.label;
    this.icon = data.icon;
    this.configSchema = data.configSchema;
  }
}
