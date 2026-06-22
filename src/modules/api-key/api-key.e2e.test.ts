import { getE2EApp } from "@/test/support/e2e-environment";
import request from "supertest";

async function getDefaultOrganizationId(): Promise<string> {
  const app = getE2EApp();
  const listed = await request(app.getHttpServer()).get("/api/organizations").expect(200);

  if ((listed.body as { id: string }[]).length > 0) {
    return listed.body[0].id;
  }

  const created = await request(app.getHttpServer())
    .post("/api/organizations")
    .send({ slug: "default", name: "Default" })
    .expect(201);

  return created.body.id;
}

async function deleteAllApiKeys(): Promise<void> {
  const app = getE2EApp();
  const listed = await request(app.getHttpServer()).get("/api/api-keys").expect(200);

  for (const row of listed.body as { id: string }[]) {
    await request(app.getHttpServer()).delete(`/api/api-keys/${row.id}`).expect(204);
  }
}

describe("ApiKey (e2e)", () => {
  let organizationId: string;

  beforeAll(async () => {
    organizationId = await getDefaultOrganizationId();
  });

  beforeEach(async () => {
    await deleteAllApiKeys();
  });

  it("creates an api key and returns the secret only once", async () => {
    const response = await request(getE2EApp().getHttpServer())
      .post("/api/api-keys")
      .send({
        organizationId,
        name: "Production",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);

    expect(response.body).toMatchObject({
      organizationId,
      name: "Production",
      enabled: true,
    });
    expect(response.body.key).toMatch(/^sk_/);
    expect(response.body.id).toBeDefined();
  });

  it("lists api keys without exposing the secret", async () => {
    const app = getE2EApp();

    await request(app.getHttpServer())
      .post("/api/api-keys")
      .send({ organizationId, name: "Production" })
      .expect(201);

    const listed = await request(app.getHttpServer()).get("/api/api-keys").expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      organizationId,
      name: "Production",
    });
    expect(listed.body[0]).not.toHaveProperty("key");
  });

  it("updates an api key", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-keys")
      .send({ organizationId, name: "Production" })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .put("/api/api-keys")
      .send({
        id: created.body.id,
        name: "Staging",
        enabled: false,
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      name: "Staging",
      enabled: false,
    });
    expect(updated.body).not.toHaveProperty("key");
  });

  it("refreshes an api key and returns a new secret", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-keys")
      .send({ organizationId, name: "Production" })
      .expect(201);

    const refreshed = await request(app.getHttpServer())
      .post(`/api/api-keys/${created.body.id}/refresh`)
      .expect(200);

    expect(refreshed.body).toMatchObject({
      id: created.body.id,
      name: "Production",
    });
    expect(refreshed.body.key).toMatch(/^sk_/);
    expect(refreshed.body.key).not.toBe(created.body.key);
  });

  it("deletes an api key", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/api-keys")
      .send({ organizationId, name: "Production" })
      .expect(201);

    await request(app.getHttpServer()).delete(`/api/api-keys/${created.body.id}`).expect(204);

    const listed = await request(app.getHttpServer()).get("/api/api-keys").expect(200);
    expect(listed.body).toHaveLength(0);
  });

  it("returns 400 when expiresAt is in the past", async () => {
    await request(getE2EApp().getHttpServer())
      .post("/api/api-keys")
      .send({
        organizationId,
        name: "Production",
        expiresAt: new Date("2020-01-01T00:00:00.000Z").toISOString(),
      })
      .expect(400);
  });

  it("returns 404 when organization does not exist", async () => {
    await request(getE2EApp().getHttpServer())
      .post("/api/api-keys")
      .send({
        organizationId: "00000000-0000-4000-8000-000000000099",
        name: "Production",
      })
      .expect(404);
  });

  it("returns 404 when refreshing a missing api key", async () => {
    await request(getE2EApp().getHttpServer())
      .post("/api/api-keys/00000000-0000-4000-8000-000000000099/refresh")
      .expect(404);
  });
});
