import { PackageManifest } from "@/runner";

import manifestJson from "./manifest.json";
import { fileSystemStorageRunner, logRunner, sleepRunner } from "./runners";

const { $schema: _packageJsonSchema, ...manifest } = manifestJson;
const pkg = PackageManifest.fromManifest(manifest as PackageManifest);

export const InternalPackage = {
  manifest: pkg,
  runners: [
    logRunner,
    sleepRunner,
    fileSystemStorageRunner,
  ],
};