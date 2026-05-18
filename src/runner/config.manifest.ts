import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { configManifestSchema } from "@snipet/runner";

import { FieldManifest } from "./field.manifest";

export class ConfigManifest {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  docs?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ type: [FieldManifest] })
  fields?: FieldManifest[];

  constructor(data: ConfigManifest) {
    configManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: ConfigManifest): ConfigManifest {
    return new ConfigManifest(manifest);
  }
}
