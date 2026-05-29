import { getE2EApp } from "@/test/support/e2e-environment";
import request from "supertest";

import {
  deleteAllLlmConnections, mockLlmConnectionPayload, withRootApiKey
} from "../connection/llm-connection.e2e.test";

async function createMockConnection(app: ReturnType<typeof getE2EApp>): Promise<string> {
  const created = await withRootApiKey(
    request(app.getHttpServer()).post("/api/llm-connection"),
  )
    .send({ name: "Mock Runner", ...mockLlmConnectionPayload, enabled: true })
    .expect(201);

  return created.body.id as string;
}

describe("LlmRunner (e2e)", () => {
  beforeEach(async () => {
    await deleteAllLlmConnections();
  });

  it("rejects requests without x-api-key", async () => {
    await request(getE2EApp().getHttpServer())
      .post("/api/llm-runner/text")
      .send({
        llmConnectionId: "00000000-0000-4000-8000-000000000001",
        modelId: "mock-text",
        messages: [{ role: "user", content: "hi" }],
      })
      .expect(401);
  });

  it("generates text with mock provider", async () => {
    const app = getE2EApp();
    const llmConnectionId = await createMockConnection(app);

    const response = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-runner/text"),
    )
      .send({
        llmConnectionId,
        modelId: "mock-text",
        messages: [{ role: "user", content: "hello" }],
      })
      .expect(200);

    expect(response.body).toMatchObject({
      modelId: "mock-text",
      content: "mock:hello",
    });
  });

  it("generates embeddings with mock provider", async () => {
    const app = getE2EApp();
    const llmConnectionId = await createMockConnection(app);

    const response = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-runner/embedding"),
    )
      .send({
        llmConnectionId,
        modelId: "mock-embedding",
        input: "semantic query",
      })
      .expect(200);

    expect(response.body.embeddings).toEqual([[0.1, 0.2, 0.3]]);
  });

  it("streams text with mock provider", async () => {
    const app = getE2EApp();
    const llmConnectionId = await createMockConnection(app);

    const response = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-runner/stream"),
    )
      .send({
        llmConnectionId,
        modelId: "mock-text",
        messages: [{ role: "user", content: "stream me" }],
      })
      .expect(200);

    expect(response.headers["content-type"]).toContain("text/event-stream");
    expect(response.text).toContain('"chunk"');
    expect(response.text).toContain("[DONE]");
  });

  it("generates video and audio with mock provider", async () => {
    const app = getE2EApp();
    const llmConnectionId = await createMockConnection(app);

    const video = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-runner/video"),
    )
      .send({
        llmConnectionId,
        modelId: "mock-video",
        prompt: "sunset",
      })
      .expect(200);

    expect(video.body.status).toBe("completed");
    expect(video.body.videoUrl).toContain("mock.local");

    const audio = await withRootApiKey(
      request(app.getHttpServer()).post("/api/llm-runner/audio"),
    )
      .send({
        llmConnectionId,
        modelId: "mock-audio",
        text: "hello",
      })
      .expect(200);

    expect(audio.body.transcript).toBe("hello");
    expect(audio.body.audioBase64).toBeTruthy();
  });
});
