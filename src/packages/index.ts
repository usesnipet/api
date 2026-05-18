import type { PackageManifest, RunnerDef } from "@snipet/runner";

import { InternalPackage } from "./internal";

export type PackageRegistry = Array<{
  manifest: PackageManifest;
  runners: RunnerDef[];
}>;

export const packages: PackageRegistry = [
  InternalPackage,
];
