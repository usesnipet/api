import * as apiKeySchema from "./api-key";
import * as indexedItemSchema from "./indexed-item";
import * as knowledgeIndexSchema from "./knowledge-index";
import * as knowledgeSourceSchema from "./knowledge-source";
import * as llmConnectionSchema from "./llm-connection";
import * as memorySchema from "./memory";
import * as pipelineSchema from "./pipeline";
import * as pipelineRunSchema from "./pipeline-run";
import * as pipelineStepRunSchema from "./pipeline-step-run";
import * as sourceIndexSchema from "./source-index";
import * as sourceItemSchema from "./source-item";

export * from "./api-key";
export * from "./indexed-item";
export * from "./knowledge-index";
export * from "./knowledge-source";
export * from "./llm-connection";
export * from "./memory";
export * from "./pipeline";
export * from "./pipeline-run";
export * from "./pipeline-step-run";
export * from "./source-index";
export * from "./source-item";

export const schemas = {
  ...apiKeySchema,
  ...indexedItemSchema,
  ...knowledgeIndexSchema,
  ...knowledgeSourceSchema,
  ...llmConnectionSchema,
  ...memorySchema,
  ...pipelineSchema,
  ...pipelineRunSchema,
  ...pipelineStepRunSchema,
  ...sourceIndexSchema,
  ...sourceItemSchema,
};
