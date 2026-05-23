import { ProviderRegistry } from "@/common/provider";
import { Injectable } from "@nestjs/common";

import { s3SourceDefinition } from "./s3/s3.definition";
import type { SourceProviderDefinition } from "./source-provider.types";

@Injectable()
export class SourceProviderRegistry extends ProviderRegistry<SourceProviderDefinition> {
  constructor() {
    super();
    this.register(s3SourceDefinition);
  }
}
