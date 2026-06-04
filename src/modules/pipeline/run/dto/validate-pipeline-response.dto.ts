import { ApiProperty } from "@nestjs/swagger";

export class ValidatePipelineResponseDto {
  @ApiProperty({ example: true })
  valid!: true;

  constructor() {
    this.valid = true;
  }
}
