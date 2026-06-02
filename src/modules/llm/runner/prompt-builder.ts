import { Injectable } from "@nestjs/common";
import mustache from "mustache";

type PromptVariables = Record<string, string>;
@Injectable()
export class PromptBuilder {
  build(prompt: string, variables: PromptVariables): string {
    return mustache.render(prompt, variables);
  }
}