export interface OpenAiLlmConfig extends Record<string, unknown> {
  apiKey: string;
  baseUrl?: string;
  organizationId?: string;
}
