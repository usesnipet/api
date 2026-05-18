import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { nodeManifestSchema } from "@snipet/runner";

export class NodeManifest {
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

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional()
  config?: string;

  constructor(data: NodeManifest) {
    nodeManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeManifest): NodeManifest {
    return new NodeManifest(manifest);
  }
}
