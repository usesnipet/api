import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  flowConnectionInManifestSchema,
  flowConnectionManifestSchema,
  flowConnectionOutManifestSchema,
  flowManifestSchema,
  flowNodeRefManifestSchema,
} from "@snipet/runner";

export class FlowNodeRefManifest {
  @ApiProperty()
  instanceId!: string;

  @ApiProperty()
  nodeId!: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  config?: Record<string, unknown>;

  @ApiProperty()
  x!: number;

  @ApiProperty()
  y!: number;

  constructor(data: FlowNodeRefManifest) {
    flowNodeRefManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FlowNodeRefManifest): FlowNodeRefManifest {
    return new FlowNodeRefManifest(manifest);
  }
}

export class FlowConnectionOutManifest {
  @ApiProperty()
  instanceId!: string;

  @ApiProperty()
  outputId!: string;

  constructor(data: FlowConnectionOutManifest) {
    flowConnectionOutManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FlowConnectionOutManifest): FlowConnectionOutManifest {
    return new FlowConnectionOutManifest(manifest);
  }
}

export class FlowConnectionInManifest {
  @ApiProperty()
  instanceId!: string;

  @ApiProperty()
  inputId!: string;

  constructor(data: FlowConnectionInManifest) {
    flowConnectionInManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FlowConnectionInManifest): FlowConnectionInManifest {
    return new FlowConnectionInManifest(manifest);
  }
}

export class FlowConnectionManifest {
  @ApiProperty({ type: FlowConnectionOutManifest })
  source!: FlowConnectionOutManifest;

  @ApiProperty({ type: FlowConnectionInManifest })
  target!: FlowConnectionInManifest;

  @ApiProperty()
  active!: boolean;

  constructor(data: FlowConnectionManifest) {
    flowConnectionManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FlowConnectionManifest): FlowConnectionManifest {
    return new FlowConnectionManifest(manifest);
  }
}

export class FlowManifest {
  @ApiProperty({ type: [FlowNodeRefManifest], default: [] })
  nodes!: FlowNodeRefManifest[];

  @ApiProperty({ type: [FlowConnectionManifest], default: [] })
  connections!: FlowConnectionManifest[];

  constructor(data: FlowManifest) {
    flowManifestSchema.parse(data);
    Object.assign(this, data);
  }

  static fromManifest(manifest: FlowManifest): FlowManifest {
    return new FlowManifest(manifest);
  }
}
