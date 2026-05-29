export interface LlmErrorDetails {
  provider?: string;
  modelId?: string;
  llmConnectionId?: string;
  limit?: number;
  requested?: number;
  retryAfterMs?: number;
  capability?: string;
  [key: string]: unknown;
}
