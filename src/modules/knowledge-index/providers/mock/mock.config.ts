export interface MockIndexConfig extends Record<string, unknown> {
  outcome: "success" | "failure";
}
