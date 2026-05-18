import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { packageManifestSchema } from "@snipet/runner";

import { ConfigManifest } from "./config.manifest";
import { NodeManifest } from "./node.manifest";
import { NodeTypeManifest } from "./node-type.manifest";

export class PackageManifest {
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

  @ApiPropertyOptional()
  author?: string;

  @ApiProperty({ type: [NodeTypeManifest] })
  nodeTypes!: NodeTypeManifest[];

  @ApiProperty({ type: [ConfigManifest] })
  configs!: ConfigManifest[];

  @ApiProperty({ type: [NodeManifest] })
  nodes!: NodeManifest[];

  @ApiProperty({ example: "1.0.0" })
  version!: string;

  constructor(data: PackageManifest) {
    packageManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: PackageManifest): PackageManifest {
    return new PackageManifest(manifest);
  }
}
