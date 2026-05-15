import { FlowManifest } from "@/core/manifest/flow";
import type { FlowRow } from "@/db/schema/flow";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class Flow {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ type: FlowManifest })
  code: FlowManifest;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(data: FlowRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
  }
}
