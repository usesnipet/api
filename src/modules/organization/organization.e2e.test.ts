import { getE2EApp } from "@/test/support/e2e-environment";
import request from "supertest";

const createPayload = {
  slug: "acme-corp",
  name: "Acme Corp",
} as const;

async function deleteAllOrganizations(): Promise<void> {
  const app = getE2EApp();
  const listed = await request(app.getHttpServer()).get("/api/organizations").expect(200);

  for (const row of listed.body as { id: string }[]) {
    await request(app.getHttpServer()).delete(`/api/organizations/${row.id}`).expect(204);
  }
}

describe("Organization (e2e)", () => {
  beforeEach(async () => {
    await deleteAllOrganizations();
  });

  it("creates an organization", async () => {
    const response = await request(getE2EApp().getHttpServer())
      .post("/api/organizations")
      .send(createPayload)
      .expect(201);

    expect(response.body).toMatchObject({
      slug: "acme-corp",
      name: "Acme Corp",
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("lists organizations", async () => {
    const app = getE2EApp();

    await request(app.getHttpServer()).post("/api/organizations").send(createPayload).expect(201);

    const listed = await request(app.getHttpServer()).get("/api/organizations").expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      slug: "acme-corp",
      name: "Acme Corp",
    });
  });

  it("filters organizations by slug", async () => {
    const app = getE2EApp();

    await request(app.getHttpServer()).post("/api/organizations").send(createPayload).expect(201);
    await request(app.getHttpServer())
      .post("/api/organizations")
      .send({ slug: "globex", name: "Globex" })
      .expect(201);

    const filtered = await request(app.getHttpServer())
      .get("/api/organizations")
      .query({ "where[slug][eq]": "acme-corp" })
      .expect(200);

    expect(filtered.body).toHaveLength(1);
    expect(filtered.body[0]).toMatchObject({ slug: "acme-corp" });
  });

  it("updates an organization", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/organizations")
      .send(createPayload)
      .expect(201);

    const updated = await request(app.getHttpServer())
      .put("/api/organizations")
      .send({
        id: created.body.id,
        name: "Acme Incorporated",
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      slug: "acme-corp",
      name: "Acme Incorporated",
    });
  });

  it("deletes an organization", async () => {
    const app = getE2EApp();

    const created = await request(app.getHttpServer())
      .post("/api/organizations")
      .send(createPayload)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/organizations/${created.body.id}`)
      .expect(204);

    const listed = await request(app.getHttpServer()).get("/api/organizations").expect(200);
    expect(listed.body).toHaveLength(0);
  });

  it("returns 409 when creating with a duplicate slug", async () => {
    const app = getE2EApp();

    await request(app.getHttpServer()).post("/api/organizations").send(createPayload).expect(201);

    await request(app.getHttpServer()).post("/api/organizations").send(createPayload).expect(409);
  });

  it("returns 400 for an invalid slug", async () => {
    await request(getE2EApp().getHttpServer())
      .post("/api/organizations")
      .send({ slug: "Invalid Slug", name: "Acme Corp" })
      .expect(400);
  });

  it("returns 404 when updating a missing organization", async () => {
    await request(getE2EApp().getHttpServer())
      .put("/api/organizations")
      .send({
        id: "00000000-0000-4000-8000-000000000099",
        name: "Missing",
      })
      .expect(404);
  });

  it("returns 404 when deleting a missing organization", async () => {
    await request(getE2EApp().getHttpServer())
      .delete("/api/organizations/00000000-0000-4000-8000-000000000099")
      .expect(404);
  });
});
