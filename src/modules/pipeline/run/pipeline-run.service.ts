import { BaseService } from "@/common/crud";
import { pipeline as pipelineTable } from "@/db/schema/pipeline";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { PipelineRunner } from "../pipeline.runner";

import { RunPipelineResponseDto } from "./dto/run-pipeline-response.dto";
import { ValidatePipelineDto } from "./dto/validate-pipeline.dto";

@Injectable()
export class PipelineRunService extends BaseService {
  validate(dto: ValidatePipelineDto): void {
    try {
      PipelineRunner.validateSchema(dto.definition);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async run(pipelineId: string, inputs: Record<string, unknown>): Promise<RunPipelineResponseDto> {
    const [row] = await this.db()
      .select()
      .from(pipelineTable)
      .where(eq(pipelineTable.id, pipelineId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`Pipeline ${pipelineId} not found`);
    }

    try {
      const runner = PipelineRunner.create(row.definition).hydrateInputs(inputs);
      return new RunPipelineResponseDto(runner.getDefinition());
    } catch (error) {
      throw new BadRequestException(error.message, { cause: error });
    }
  }
}
