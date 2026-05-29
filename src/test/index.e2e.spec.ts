import "@/modules/api-key/api-key.e2e.test";
import "@/modules/knowledge-index/knowledge-index.e2e.test";
import "@/modules/knowledge-source/knowledge-source.e2e.test";
import "@/modules/llm/connection/llm-connection.e2e.test";
import "@/modules/llm/runner/llm-runner.e2e.test";

import { setupE2EEnvironment, teardownE2EEnvironment } from "./support/e2e-environment";

beforeAll(async () => {
  await setupE2EEnvironment();
}, 120_000);

afterAll(async () => {
  await teardownE2EEnvironment();
}, 120_000);
