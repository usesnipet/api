import { getE2EApp, ROOT_TEST_API_KEY } from "@/test/support/e2e-environment";
import request from "supertest";

export function withRootApiKey(req: request.Test): request.Test {
  return req.set("x-api-key", ROOT_TEST_API_KEY);
}

export async function deleteAllLlmConnections(): Promise<void> {
  const app = getE2EApp();
  const listed = await withRootApiKey(
    request(app.getHttpServer()).get("/api/llm-connection"),
  ).expect(200);
  for (const row of listed.body as { id: string }[]) {
    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/llm-connection/${row.id}`),
    ).expect(204);
  }
}

export const mockLlmConnectionPayload = {
  provider: "mock",
  config: { outcome: "success" },
} as const;

export const openAiLlmConnectionPayload = {
  name: "OpenAI",
  provider: "openai",
  config: {
    apiKey: "sk-test-key",
    baseUrl: "https://api.openai.com/v1",
  },
  enabled: true,
} as const;

describe("LlmConnection (e2e)", () => {
  beforeEach(async () => {
    await deleteAllLlmConnections();
  });

  it("rejects requests without x-api-key", async () => {
    await request(getE2EApp().getHttpServer()).get("/api/llm-connection").expect(401);
  });

  it("lists available providers", async () => {
    const response = await withRootApiKey(
      request(getE2EApp().getHttpServer()).get("/api/llm-connection/providers"),
    ).expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "openai",
          label: "OpenAI",
          icon: expect.stringContaining("<svg"),
        }),
        expect.objectContaining({
          id: "google",
          label: "Google",
        }),
        expect.objectContaining({
          id: "mock",
          label: "Mock (tests only)",
        }),
      ]),
    );
  });

  it("creates an OpenAI connection and omits encrypted fields in the response", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-connection"),
    )
      .send(openAiLlmConnectionPayload)
      .expect(201);

    expect(created.body).toMatchObject({
      name: "OpenAI",
      provider: "openai",
      enabled: true,
      config: {
        baseUrl: "https://api.openai.com/v1",
      },
    });
    expect(created.body.config).not.toHaveProperty("apiKey");
    expect(created.body.id).toBeDefined();
  });

  it("lists LLM connections", async () => {
    const app = getE2EApp();

    await withRootApiKey(request(app.getHttpServer()).post("/api/llm-connection"))
      .send(openAiLlmConnectionPayload)
      .expect(201);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/llm-connection"),
    ).expect(200);

    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      name: "OpenAI",
      provider: "openai",
    });
  });

  it("returns 200 when test-connection config is valid", async () => {
    const response = await withRootApiKey(
      request(getE2EApp().getHttpServer()).post("/api/llm-connection/test-connection"),
    )
      .send(mockLlmConnectionPayload)
      .expect(200);

    expect(response.body).toMatchObject({
      duration: expect.any(Number),
    });
    expect(response.body.duration).toBeGreaterThanOrEqual(0);
  });

  it("lists models for a mock connection", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-connection"),
    )
      .send({
        name: "Mock",
        provider: "mock",
        config: { outcome: "success" },
        enabled: true,
      })
      .expect(201);

    const models = await withRootApiKey(
      request(app.getHttpServer()).get(
        `/api/llm-connection/${created.body.id}/models?type=text`,
      ),
    ).expect(200);

    expect(models.body).toEqual([
      expect.objectContaining({ modelId: "mock-text", type: "text" }),
    ]);
  });

  it("updates name and enabled flag", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-connection"),
    )
      .send(openAiLlmConnectionPayload)
      .expect(201);

    const updated = await withRootApiKey(
      request(app.getHttpServer()).put("/api/llm-connection"),
    )
      .send({
        id: created.body.id,
        name: "OpenAI staging",
        enabled: false,
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      name: "OpenAI staging",
      enabled: false,
    });
  });

  it("deletes an LLM connection", async () => {
    const app = getE2EApp();

    const created = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-connection"),
    )
      .send(openAiLlmConnectionPayload)
      .expect(201);

    await withRootApiKey(
      request(app.getHttpServer()).delete(`/api/llm-connection/${created.body.id}`),
    ).expect(204);

    const listed = await withRootApiKey(
      request(app.getHttpServer()).get("/api/llm-connection"),
    ).expect(200);

    expect(listed.body).toHaveLength(0);
  });
});
