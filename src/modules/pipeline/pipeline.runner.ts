import { parseDocument, YAMLParseError } from "yaml";

import { PipelineHydrationError, PipelineValidationError } from "./errors";
import { PipelineDefinition, pipelineSchema } from "./pipeline.schema";

function formatYamlParseError(error: YAMLParseError): string {
  const position = error.linePos?.[0];
  if (position) {
    return `Line ${position.line}, column ${position.col}: ${error.message}`;
  }
  return error.message;
}

export class PipelineRunner {
  constructor(private readonly def: PipelineDefinition) {}

  getDefinition(): PipelineDefinition {
    return this.def;
  }

  hydrateInputs(inputs: Record<string, any>): PipelineRunner {
    try {
      this.def.steps.forEach(step => {
        Object.entries(step).forEach(([key, value]) => {
          if (typeof value === "string" && value.startsWith("{{input.")) {
            const inputKey = value.slice(7, -1);
            if (!inputs[inputKey]) {
              throw new PipelineHydrationError(
                "input",
                `Input key "${inputKey}" not found in inputs`,
                { cause: inputs },
              );
            }
            step[key] = inputs[inputKey];
          }
        });
      });
    } catch (error) {
      if (error instanceof PipelineHydrationError) throw error;
      throw new PipelineHydrationError("input", "Failed to hydrate inputs", { cause: error });
    }
    return this;
  }

  static create(definition: string | PipelineDefinition): PipelineRunner {
    return new PipelineRunner(PipelineRunner.validateSchema(definition));
  }

  private static validateSyntax(definition: string): void {
    const trimmed = definition.trim();
    if (!trimmed) throw new PipelineValidationError("YAML cannot be empty");

    const doc = parseDocument(trimmed, { strict: true });
    if (doc.errors.length > 0) {
      throw new PipelineValidationError(formatYamlParseError(doc.errors[0]!), { cause: doc.errors[0] });
    }
  }

  static validateSchema(definition: string | PipelineDefinition): PipelineDefinition {
    let json: any;
    if (typeof definition === "string") {
      PipelineRunner.validateSyntax(definition);
      const doc = parseDocument(definition, { strict: true });
      json = doc.toJSON();
    } else {
      json = definition;
    }
    const result = pipelineSchema.safeParse(json);
    if (!result.success) {
      throw new PipelineValidationError(result.error.message, { cause: result.error });
    }
    return result.data;
  }
}