import { ConfigManifest } from "../../manifest/config";

import { BaseRegistry } from "./base-registry";

export class ConfigRegistry extends BaseRegistry<ConfigManifest> {
  constructor() {
    super(ConfigManifest);
  }
}