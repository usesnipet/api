import { FlowManifest } from "../../manifest/flow";

import { BaseRegistry } from "./base-registry";

export class FlowRegistry extends BaseRegistry<FlowManifest> {
  constructor() {
    super(FlowManifest);
  }
}