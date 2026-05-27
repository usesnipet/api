import { ProviderRegistry } from "@/common/provider";
import { env } from "@/env";
import { Injectable } from "@nestjs/common";

import { mockSourceDefinition } from "./mock/mock.definition";
import { s3SourceDefinition } from "./s3/s3.definition";
import type { SourceProviderDefinition } from "./source-provider.types";

@Injectable()
export class SourceProviderRegistry extends ProviderRegistry<SourceProviderDefinition> {
  constructor() {
    super();
    this.register(s3SourceDefinition);
    if (env.NODE_ENV === "test") {
      this.register(mockSourceDefinition);
    }
  }
}
