import type { RunnerDef } from "@snipet/runner";

import { PackageManifest } from "@/runner";

import { AwsPackage } from "./aws";
import { InternalPackage } from "./internal";

export type PackageRegistry = Array<{
  manifest: PackageManifest;
  runners: RunnerDef[];
}>;

export const packages: PackageRegistry = [
  InternalPackage,
  AwsPackage,
];
