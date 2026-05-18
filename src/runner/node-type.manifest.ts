import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  nodeTypeComponentManifestSchema,
  nodeTypeInputManifestSchema,
  nodeTypeInputWidgetManifestSchema,
  nodeTypeManifestSchema,
  nodeTypeOutputManifestSchema,
} from "@snipet/runner";

export enum InputWidget {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export class NodeTypeInputWidgetManifest {
  @ApiProperty({ enum: InputWidget })
  type!: InputWidget;

  constructor(data: NodeTypeInputWidgetManifest) {
    nodeTypeInputWidgetManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeTypeInputWidgetManifest): NodeTypeInputWidgetManifest {
    return new NodeTypeInputWidgetManifest(manifest);
  }
}

export class NodeTypeInputManifest {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  required?: boolean;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  defaultValue?: unknown;

  @ApiPropertyOptional({ type: NodeTypeInputWidgetManifest })
  inputWidget?: NodeTypeInputWidgetManifest;

  constructor(data: NodeTypeInputManifest) {
    nodeTypeInputManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeTypeInputManifest): NodeTypeInputManifest {
    return new NodeTypeInputManifest(manifest);
  }
}

export class NodeTypeOutputManifest {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  required?: boolean;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  defaultValue?: unknown;

  constructor(data: NodeTypeOutputManifest) {
    nodeTypeOutputManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeTypeOutputManifest): NodeTypeOutputManifest {
    return new NodeTypeOutputManifest(manifest);
  }
}

export class NodeTypeComponentManifest {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional()
  required?: boolean;

  constructor(data: NodeTypeComponentManifest) {
    nodeTypeComponentManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeTypeComponentManifest): NodeTypeComponentManifest {
    return new NodeTypeComponentManifest(manifest);
  }
}

export class NodeTypeManifest {
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

  @ApiPropertyOptional({ type: [NodeTypeInputManifest] })
  inputs?: NodeTypeInputManifest[];

  @ApiPropertyOptional({ type: [NodeTypeOutputManifest] })
  outputs?: NodeTypeOutputManifest[];

  @ApiPropertyOptional({ type: [NodeTypeComponentManifest] })
  components?: NodeTypeComponentManifest[];

  constructor(data: NodeTypeManifest) {
    nodeTypeManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: NodeTypeManifest): NodeTypeManifest {
    return new NodeTypeManifest(manifest);
  }
}
