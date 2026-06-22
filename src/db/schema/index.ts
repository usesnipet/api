import * as apiKeySchema from "./api-key";
import * as botSchema from "./bot";
import * as clientSchema from "./client";
import * as clientUserSchema from "./client-user";
import * as conversationSchema from "./conversation";
import * as knowledgeBaseSchema from "./knowledge-base";
import * as memberSchema from "./member";
import * as memorySchema from "./memory";
import * as organizationSchema from "./organization";
import * as userSchema from "./user";

export * from "./api-key";
export * from "./bot";
export * from "./client";
export * from "./client-user";
export * from "./conversation";
export * from "./knowledge-base";
export * from "./member";
export * from "./memory";
export * from "./organization";
export * from "./user";

export const schemas = {
  ...apiKeySchema,
  ...botSchema,
  ...clientSchema,
  ...clientUserSchema,
  ...conversationSchema,
  ...knowledgeBaseSchema,
  ...memberSchema,
  ...memorySchema,
  ...organizationSchema,
  ...userSchema,
};
