import { INestApplication } from "@nestjs/common";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { migrateTestDatabase } from "./migrate-database";

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

export const ROOT_TEST_API_KEY = "sk_test_integration_root_abcdefghij";

let container: StartedPostgreSqlContainer | null = null;
let app: INestApplication | null = null;

export function getE2EApp(): INestApplication {
  if (!app) {
    throw new Error("E2E app not initialized. Run setup via test/index.e2e.spec.ts.");
  }
  return app;
}

export async function setupE2EEnvironment(): Promise<void> {
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("snipet_test")
    .start();

  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = container.getConnectionUri();
  process.env.ROOT_API_KEY = ROOT_TEST_API_KEY;
  process.env.ENCRYPT_MASTER_PASSWORD = "integration-test-secret";

  await migrateTestDatabase(process.env.DATABASE_URL);

  jest.resetModules();

  const { buildE2EApp } = jest.requireActual("./create-e2e-app") as typeof import("./create-e2e-app");
  app = await buildE2EApp(process.env.DATABASE_URL);
}

export async function teardownE2EEnvironment(): Promise<void> {
  if (app) {
    const { TransactionManager } = jest.requireActual("@/modules/database/transaction-manager") as typeof import("@/modules/database/transaction-manager");
    const pool = app.get(TransactionManager).root.$client as unknown as import("pg").Pool;
    await app.close();
    await pool.end();
    app = null;
  }

  if (container) {
    await container.stop();
    container = null;
  }
}
