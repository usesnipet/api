import { LlmException } from "../provider/errors";

import { LlmRunnerService } from "./llm-runner.service";

describe("LlmRunnerService", () => {
  it("rejects unknown connection", async () => {
    const service = Object.create(LlmRunnerService.prototype) as LlmRunnerService;
    Object.assign(service, {
      db: () => ({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => [],
            }),
          }),
        }),
      }),
      llmProviderFactory: { createFromRow: jest.fn() },
    });

    await expect(
      service.generateText({
        llmConnectionId: "00000000-0000-4000-8000-000000000099",
        modelId: "mock-text",
        messages: [{ role: "user", content: "hi" }],
      })
    ).rejects.toBeInstanceOf(LlmException);
  });
});
