import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { fieldManifestSchema } from "@snipet/runner";

export enum FieldType {
  STRING = "string",
  INT = "int",
  FLOAT = "float",
  BOOLEAN = "boolean",
  JSON = "json",
}

export class FieldManifest {
  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: FieldType })
  type!: FieldType;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  required?: boolean;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  defaultValue?: unknown;

  @ApiPropertyOptional()
  encrypted?: boolean;

  constructor(data: FieldManifest) {
    fieldManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FieldManifest): FieldManifest {
    return new FieldManifest(manifest);
  }
}
