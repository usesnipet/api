import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  nodeTypeComponentManifestSchema, nodeTypeInputManifestSchema, nodeTypeManifestSchema,
  nodeTypeOutputManifestSchema
} from "@snipet/runner";
import { z } from "zod";

export enum InputWidget {
  TEXT = "text",
  NUMBER = "number",
  CHECKBOX = "checkbox",
  SELECT = "select",
  DATE = "date",
  TIME = "time",
  FILE = "file",
  JSON = "json",
}
const nodeTypeInputWidgetManifestSchema = z.object({
  type: z.enum([
    InputWidget.TEXT,
    InputWidget.NUMBER,
    InputWidget.CHECKBOX,
    InputWidget.SELECT,
    InputWidget.DATE,
    InputWidget.TIME,
    InputWidget.FILE,
    InputWidget.JSON,
  ]),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  placeholder: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
});
export class NodeTypeInputWidgetManifest {
  @ApiProperty({ enum: InputWidget })
  type!: InputWidget;

  @ApiPropertyOptional()
  options?: { label: string; value: string }[];

  @ApiPropertyOptional()
  placeholder?: string;

  @ApiPropertyOptional()
  label?: string;

  @ApiPropertyOptional()
  description?: string;

  constructor(data: NodeTypeInputWidgetManifest) {
    Object.assign(this, nodeTypeInputWidgetManifestSchema.parse(data));
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
    Object.assign(this, nodeTypeInputManifestSchema.extend({
      inputWidget: nodeTypeInputWidgetManifestSchema.optional(),
    }).parse(data));
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
    Object.assign(this, nodeTypeOutputManifestSchema.parse(data));
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
    Object.assign(this, nodeTypeComponentManifestSchema.parse(data));
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
    Object.assign(this, nodeTypeManifestSchema.parse(data));
  }

  static fromManifest(manifest: NodeTypeManifest): NodeTypeManifest {
    return new NodeTypeManifest(manifest);
  }
}
