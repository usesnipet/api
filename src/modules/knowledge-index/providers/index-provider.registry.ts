import { ProviderRegistry } from "@/common/provider";
import { env } from "@/env";
import { Injectable } from "@nestjs/common";

import { mockIndexDefinition } from "./mock/mock.definition";
import { pgvectorIndexDefinition } from "./pgvector/pgvector.definition";
import type { IndexProviderDefinition } from "./index-provider.types";

@Injectable()
export class IndexProviderRegistry extends ProviderRegistry<IndexProviderDefinition> {
  constructor() {
    super();
    this.register(pgvectorIndexDefinition);
    if (env.NODE_ENV === "test") {
      this.register(mockIndexDefinition);
    }
  }
}
