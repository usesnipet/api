import type { Provider } from "@/common/provider";

import type { LlmModel } from "../model/llm-model.model";
import type { LlmModelType } from "./llm-model-type";

export interface LlmProvider extends Provider {
  listModels(type?: LlmModelType): Promise<LlmModel[]>;
}
