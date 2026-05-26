import { getE2EApp, ROOT_TEST_API_KEY } from "@/test/support/e2e-environment";
import request from "supertest";

export function withRootApiKey(req: request.Test): request.Test {
  return req.set("x-api-key", ROOT_TEST_API_KEY);
}

export async function deleteAllKnowledgeSources(): Promise<void> {
  const app = getE2EApp();
  const listed = await withRootApiKey(
    request(app.getHttpServer()).get("/api/knowledge-source"),
  ).expect(200);
  for (const row of listed.body as { id: string }[]) {
    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/knowledge-source/${row.id}`),
    ).expect(204);
  }
}

export const s3KnowledgeSourcePayload = {
  name: "Docs",
  description: "Documentation in S3",
  provider: "s3",
  config: {
    bucket: "snipet-docs",
    region: "us-east-1",
    accessKeyId: "AKIATESTKEY",
    secretAccessKey: "secret-access-key",
  },
} as const;


describe("KnowledgeSource (e2e)", () => {
  beforeEach(async () => {
    await deleteAllKnowledgeSources();
  });

  it("rejects requests without x-api-key", async () => {
    await request(getE2EApp().getHttpServer())
      .get("/api/knowledge-source")
      .expect(401);
  });

  it("lists available providers", async () => {
    const response = await withRootApiKey(
      request(getE2EApp().getHttpServer()).get("/api/knowledge-source/providers"),
    ).expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "s3",
          label: "S3 / MinIO",
          icon: expect.stringContaining("<svg"),
        }),
      ]),
    );
  });

  it("creates an S3 source and omits encrypted fields in the response", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    expect(created.body).toMatchObject({
      name: "Docs",
      description: "Documentation in S3",
      provider: "s3",
      config: {
        bucket: "snipet-docs",
        region: "us-east-1",
      },
    });
    expect(created.body.config).not.toHaveProperty("accessKeyId");
    expect(created.body.config).not.toHaveProperty("secretAccessKey");
    expect(created.body.id).toBeDefined();
  });

  it("lists knowledge sources", async () => {
    const app = getE2EApp();

    await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/knowledge-source"),
    ).expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      name: "Docs",
      provider: "s3",
    });
  });

  it("returns canEdit true on find when no source items exist", async () => {
    const app = getE2EApp();

    await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/knowledge-source"),
    ).expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0].canEdit).toBe(true);
  });

  it("updates name and description", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-source"),
    )
      .send({
        id: created.body.id,
        name: "Docs v2",
        description: "Updated bucket",
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      name: "Docs v2",
      description: "Updated bucket",
      provider: "s3",
    });
  });

  it("allows config changes before the first synchronization", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-source"),
    )
      .send({
        id: created.body.id,
        config: {
          bucket: "snipet-docs-v2",
          region: "sa-east-1",
        },
      })
      .expect(200);

    expect(updated.body.config).toEqual({
      bucket: "snipet-docs-v2",
      region: "sa-east-1",
    });
  });

  it("blocks config changes after source items exist", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    const { sourceItem } = jest.requireActual("@/db/schema/source-item") as typeof import("@/db/schema/source-item");
    const { TransactionManager } = jest.requireActual("@/modules/database/transaction-manager") as typeof import("@/modules/database/transaction-manager");

    await app.get(TransactionManager).root.insert(sourceItem).values({
      knowledgeSourceId: created.body.id,
      externalId: "file-1",
      hash: "abc123",
      size: 1024,
    });

    await withRootApiKey(
      request(app.getHttpServer()).put("/api/knowledge-source"),
    )
      .send({
        id: created.body.id,
        config: { bucket: "other-bucket", region: "us-east-1" },
      })
      .expect(409);
  });

  it("deletes a knowledge source by id", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/knowledge-source"),
    )
      .send(s3KnowledgeSourcePayload)
      .expect(201);

    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/knowledge-source/${created.body.id}`),
    ).expect(204);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/knowledge-source"),
    ).expect(200);

    expect(listed.body).toHaveLength(0);
  });

  it("returns 404 when deleting a non-existent knowledge source", async () => {
    await withRootApiKey(
      request(getE2EApp().getHttpServer()).delete(
        "/api/knowledge-source/00000000-0000-4000-8000-000000000099",
      ),
    ).expect(404);
  });
});
