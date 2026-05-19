import { PackageManifest } from "@/runner";

import manifestJson from "./manifest.json";
import {
  dynamodbGetItemRunner, dynamodbPutItemRunner, lambdaInvokeRunner, s3GetObjectRunner, s3PutObjectRunner,
  secretsManagerGetSecretRunner, sesSendEmailRunner, snsPublishRunner, sqsSendMessageRunner
} from "./runners";

const { $schema: _packageJsonSchema, ...manifest } = manifestJson;
const pkg = PackageManifest.fromManifest(manifest as PackageManifest);

export const AwsPackage = {
  manifest: pkg,
  runners: [
    s3PutObjectRunner,
    s3GetObjectRunner,
    lambdaInvokeRunner,
    dynamodbPutItemRunner,
    dynamodbGetItemRunner,
    sqsSendMessageRunner,
    snsPublishRunner,
    sesSendEmailRunner,
    secretsManagerGetSecretRunner,
  ],
};
