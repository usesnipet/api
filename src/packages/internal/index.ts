import { parsePackageManifest } from "@snipet/runner";

import manifestJson from "./manifest.json";
import { fileSystemStorageRunner, logRunner, sleepRunner } from "./runners";

const { $schema: _packageJsonSchema, ...manifest } = manifestJson;
const pkg = parsePackageManifest(manifest);

export const InternalPackage = {
  manifest: pkg,
  runners: [
    logRunner,
    sleepRunner,
    fileSystemStorageRunner,
  ],
};