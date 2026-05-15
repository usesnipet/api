import { RunnerDef } from "@/core/runtime/runner";
import { PackageManifest } from "@/core/manifest/package";

import { InternalPackage } from "./internal";

export type PackageRegistry = Array<{
  manifest: PackageManifest;
  runners: RunnerDef[];
}>;

export const packages: PackageRegistry = [
  InternalPackage,
];
