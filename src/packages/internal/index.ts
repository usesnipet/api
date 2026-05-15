import { PackageManifest } from "@/core/manifest/package";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import manifestJson from "./manifest.json";
import { fileSystemStorageRunner, logRunner, sleepRunner } from "./runners";

const { $schema: _packageJsonSchema, ...manifest } = manifestJson;
const pkg = plainToInstance(PackageManifest, manifest);
const errors = validateSync(pkg as any, { whitelist: true, forbidUnknownValues: false });
if (errors.length) {
  throw new Error(`InternalPackage manifest is invalid: ${errors.map((e) => e.toString()).join("; ")}`);
}

export const InternalPackage = {
  manifest: pkg,
  runners: [
    logRunner,
    sleepRunner,
    fileSystemStorageRunner,
  ],
};