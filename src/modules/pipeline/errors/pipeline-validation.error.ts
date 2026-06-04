export class PipelineValidationError extends Error {
  constructor(message: string, public readonly details?: { cause?: unknown } & unknown) {
    super(message);
    this.name = "PipelineValidationError";
    this.details = details ?? {};
  }
}