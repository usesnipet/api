export interface MockLlmConfig extends Record<string, unknown> {
  outcome: "success" | "failure";
}
