import { Module } from "@nestjs/common";

import { NodeTypeModule } from "../node-type/node-type.module";

import { PackageController } from "./package.controller";
import { PackageService } from "./package.service";

@Module({
  imports: [NodeTypeModule],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
