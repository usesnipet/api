import { NodeTypeManifest } from "../../manifest/node-type";

import { BaseRegistry } from "./base-registry";

export class NodeTypeRegistry extends BaseRegistry<NodeTypeManifest> {
  constructor() {
    super(NodeTypeManifest);
  }
}

