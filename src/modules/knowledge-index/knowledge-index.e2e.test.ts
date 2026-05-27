import { getE2EApp, ROOT_TEST_API_KEY } from "@/test/support/e2e-environment";
import request from "supertest";

import { ENCRYPTED_FIELD_PLACEHOLDER } from "../config-schema";

export function withRootApiKey(req: request.Test): request.Test {
  return req.set("x-api-key", ROOT_TEST_API_KEY);
}

export async function deleteAllKnowledgeIndexes(): Promise<void> {
  const app = getE2EApp();
  const listed = await withRootApiKey(
    request(app.getHttpServer()).get("/api/knowledge-index"),
  ).expect(200);
  for (const row of listed.body as { id: string }[]) {
    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/knowledge-index/${row.id}`),
    ).expect(204);
  }
}

export const mockKnowledgeIndexPayload = {
  name: "Mock index",
  description: "Mock knowledge index for e2e",
  provider: "mock",
  config: { outcome: "success", privateKey: "secret" },
} as const;

export const mockKnowledgeIndexConnectionPayload = {
  provider: mockKnowledgeIndexPayload.provider,
  config: mockKnowledgeIndexPayload.config,
} as const;

export const pgvectorKnowledgeIndexPayload = {
  name: "Vectors",
  description: "pgvector knowledge index",
  provider: "pgvector",
  config: {
    host: "localhost",
    port: 5432,
    database: "vectors",
    user: "postgres",
    password: "secret-password",
  },
} as const;

function testPostgresConfig(): {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
} {
  const url = new URL(process.env.DATABASE_URL!);
  return {
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

describe("KnowledgeIndex (e2e)", () => {
  beforeEach(async () => {
    await deleteAllKnowledgeIndexes();
  });

  it("rejects requests without x-api-key", async () => {
    await request(getE2EApp().getHttpServer())
      .get("/api/knowledge-index")
      .expect(401);
  });

  it("lists available providers", async () => {
    const response = await withRootApiKey(
      request(getE2EApp().getHttpServer()).get("/api/knowledge-index/providers"),
    ).expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "pgvector",
          label: "PostgreSQL (pgvector)",
          icon: expect.stringContaining("<svg"),
        }),
      ]),
    );
  });

  it("creates a pgvector index and masks encrypted fields in the response", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send(pgvectorKnowledgeIndexPayload)
      .expect(201);

    expect(created.body).toMatchObject({
      name: "Vectors",
      description: "pgvector knowledge index",
      provider: "pgvector",
      config: {
        host: "localhost",
        port: 5432,
        database: "vectors",
        user: "postgres",
        password: ENCRYPTED_FIELD_PLACEHOLDER,
      },
    });
    expect(created.body.id).toBeDefined();
    expect(created.body.llmConnectionId).toBeNull();
  });

  it("lists knowledge indexes", async () => {
    const app = getE2EApp();

    await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send(pgvectorKnowledgeIndexPayload)
      .expect(201);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/knowledge-index"),
    ).expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      name: "Vectors",
      provider: "pgvector",
    });
  });

  it("returns 404 when create references a missing LLM connection", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/knowledge-index"),
    )
      .send({
        ...pgvectorKnowledgeIndexPayload,
        llmConnectionId: "00000000-0000-4000-8000-000000000099",
      })
      .expect(404);
  });

  it("returns 200 when test-connection config is valid", async () => {
    const response = await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send(mockKnowledgeIndexConnectionPayload)
      .expect(200);

    expect(response.body).toMatchObject({
      duration: expect.any(Number),
    });
    expect(response.body.duration).toBeGreaterThanOrEqual(0);
  });

  it("returns 422 when mock test-connection is configured to fail", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send({
        provider: "mock",
        config: { outcome: "failure" },
      })
      .expect(422);
  });

  it("returns 400 when test-connection config is invalid", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send({
        provider: "pgvector",
        config: { host: "localhost" },
      })
      .expect(400);
  });

  it("returns 404 when test-connection references a missing knowledge index", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send({
        provider: "pgvector",
        config: pgvectorKnowledgeIndexPayload.config,
        knowledgeIndexId: "00000000-0000-4000-8000-000000000099",
      })
      .expect(404);
  });

  it("merges stored encrypted config when test-connection uses knowledgeIndexId", async () => {
    const app = getE2EApp();
    const postgres = testPostgresConfig();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send({
        name: "Live vectors",
        description: "Uses test database",
        provider: "pgvector",
        config: postgres,
      })
      .expect(201);

    const response = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send({
        provider: "pgvector",
        knowledgeIndexId: created.body.id,
        config: {
          host: postgres.host,
          port: postgres.port,
          database: postgres.database,
          user: postgres.user,
        },
      })
      .expect(200);

    expect(response.body.duration).toBeGreaterThanOrEqual(0);
  });

  it("updates name and description", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send(pgvectorKnowledgeIndexPayload)
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-index"),
    )
      .send({
        id: created.body.id,
        name: "Vectors v2",
        description: "Updated index",
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      name: "Vectors v2",
      description: "Updated index",
      provider: "pgvector",
    });
  });

  it("allows config updates", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send(pgvectorKnowledgeIndexPayload)
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-index"),
    )
      .send({
        id: created.body.id,
        config: {
          host: "db.internal",
          port: 5433,
          database: "vectors-v2",
          user: "app",
          password: "new-secret",
        },
      })
      .expect(200);

    expect(updated.body.config).toEqual({
      host: "db.internal",
      port: 5433,
      database: "vectors-v2",
      user: "app",
      password: ENCRYPTED_FIELD_PLACEHOLDER,
    });
  });

  it("keeps stored password when update sends placeholder asterisks", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send({
        ...mockKnowledgeIndexPayload,
        config: {
          ...mockKnowledgeIndexPayload.config,
          outcome: "failure",
        },
      })
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-index"),
    )
      .send({
        id: created.body.id,
        config: {
          outcome: "success",
        },
      })
      .expect(200);

    await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index/test-connection"),
    )
      .send({
        provider: "mock",
        knowledgeIndexId: created.body.id,
        config: {
          outcome: "success",
          privateKey: ENCRYPTED_FIELD_PLACEHOLDER,
        },
      })
      .expect(200);

    expect(updated.body.config.privateKey).toBe(ENCRYPTED_FIELD_PLACEHOLDER);
  });

  it("deletes a knowledge index by id", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-index"),
    )
      .send(pgvectorKnowledgeIndexPayload)
      .expect(201);

    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/knowledge-index/${created.body.id}`),
    ).expect(204);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/knowledge-index"),
    ).expect(200);

    expect(listed.body).toHaveLength(0);
  });

  it("returns 404 when deleting a non-existent knowledge index", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).delete(
        "/api/knowledge-index/00000000-0000-4000-8000-000000000099",
      ),
    ).expect(404);
  });
});
