export class PipelineHydrationError extends Error {
  constructor(
    public readonly hydrationType: "input" | "context",
    message: string,
    public readonly details?: { cause?: unknown } & unknown,
  ) {
    super(message);
    this.name = "PipelineHydrationError";
    this.details = details ?? {};
  }
}