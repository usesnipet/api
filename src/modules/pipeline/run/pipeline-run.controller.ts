import { ApiResponses } from "@/decorators/api-responses";
import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { RunPipelineResponseDto } from "./dto/run-pipeline-response.dto";
import { RunPipelineDto } from "./dto/run-pipeline.dto";
import { ValidatePipelineDto } from "./dto/validate-pipeline.dto";
import { PipelineRunService } from "./pipeline-run.service";

@ApiTags("pipeline-run")
@Controller("pipeline-run")
export class PipelineRunController {
  constructor(private readonly pipelineRunService: PipelineRunService) {}

  @Post("validate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses({
    200: {},
    400: {}, 401: {}, 500: {},
  })
  validate(@Body() dto: ValidatePipelineDto): void {
    return this.pipelineRunService.validate(dto);
  }

  @Post(":id/run")
  @HttpCode(HttpStatus.OK)
  @ApiResponses({
    200: { type: RunPipelineResponseDto },
    400: {}, 401: {}, 404: {}, 500: {},
  })
  run(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RunPipelineDto,
  ): Promise<RunPipelineResponseDto> {
    return this.pipelineRunService.run(id, dto.inputs);
  }
}
