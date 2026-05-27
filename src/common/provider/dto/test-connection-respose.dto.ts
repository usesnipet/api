import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class TestConnectionResponseDto {
  @ApiProperty()
  @IsNumber()
  duration!: number;

  constructor(duration: number) {
    this.duration = duration;
  }
}
