import { apiKey as apiKeyTable } from "@/db/schema/api-key";
import { getE2EApp, ROOT_TEST_API_KEY } from "@/test/support/e2e-environment";
import request from "supertest";

describe("ApiKey (e2e)", () => {
  it("rejeita requisições sem x-api-key", async () => {
    await request(getE2EApp().getHttpServer()).get("/api/api-key").expect(401);
  });

  it("rejeita chave inválida", async () => {
    await request(getE2EApp().getHttpServer())
      .get("/api/api-key")
      .set("x-api-key", "sk_test_invalid_key_1234567890")
      .expect(401);
  });

  it("cria e lista chaves com a root key", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .send({ name: "CI" })
      .expect(201);

    expect(created.body).toMatchObject({
      name: "CI",
      keyPrefix: expect.stringMatching(/^sk_test_/),
      revoked: false,
    });
    expect(created.body.key).toMatch(/^sk_test_/);
    expect(created.body.id).toBeDefined();

    const listed = await request(app.getHttpServer())
      .get("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(200);

    const names = (listed.body as { name: string; key?: string }[]).map((row) => row.name);
    expect(names).toContain("CI");
    expect(names).toContain("root");
    for (const row of listed.body as { key?: string }[]) {
      expect(row).not.toHaveProperty("key");
    }
  });

  it("autentica com chave recém-criada e atualiza lastUsedAt", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .send({ name: "App A" })
      .expect(201);

    const secret = created.body.key as string;

    await request(app.getHttpServer())
      .get("/api/api-key")
      .set("x-api-key", secret)
      .expect(200);

    const { TransactionManager } = jest.requireActual("@/modules/database/transaction-manager") as typeof import("@/modules/database/transaction-manager");
    const { eq } = jest.requireActual("drizzle-orm") as typeof import("drizzle-orm");

    const db = app.get(TransactionManager).root;
    const [row] = await db
      .select({ lastUsedAt: apiKeyTable.lastUsedAt })
      .from(apiKeyTable)
      .where(eq(apiKeyTable.id, created.body.id));

    expect(row?.lastUsedAt).toBeInstanceOf(Date);
  });

  it("revoga chave e impede uso posterior", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .send({ name: "Temp" })
      .expect(201);

    const { id, key } = created.body as { id: string; key: string };

    await request(app.getHttpServer())
      .post(`/api/api-key/${id}/revoke`)
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(201);

    await request(app.getHttpServer()).get("/api/api-key").set("x-api-key", key).expect(401);
  });

  it("não permite revogar a root key", async () => {
    const app = getE2EApp();

    const listed = await request(app.getHttpServer())
      .get("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(200);

    const root = (listed.body as { id: string; name: string }[]).find((row) => row.name === "root");
    expect(root).toBeDefined();

    await request(app.getHttpServer())
      .post(`/api/api-key/${root!.id}/revoke`)
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(400);
  });

  it("remove chave por id", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .send({ name: "Disposable" })
      .expect(201);

    const { id, key } = created.body as { id: string; key: string };

    await request(app.getHttpServer())
      .delete(`/api/api-key/${id}`)
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(200);

    await request(app.getHttpServer()).get("/api/api-key").set("x-api-key", key).expect(401);

    const listed = await request(app.getHttpServer())
      .get("/api/api-key")
      .set("x-api-key", ROOT_TEST_API_KEY)
      .expect(200);

    const ids = (listed.body as { id: string }[]).map((row) => row.id);
    expect(ids).not.toContain(id);
  });
});
