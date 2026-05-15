import { packages } from "@/packages";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { ConfigService } from "../config/config.service";
import { NodeTypeService } from "../node-type/node-type.service";
import { NodeService } from "../node/node.service";
import { PackageService } from "../package/package.service";

@Injectable()
export class SyncService implements OnModuleInit {
  @Inject() private readonly packageService: PackageService;
  @Inject() private readonly nodeTypeService: NodeTypeService;
  @Inject() private readonly configService: ConfigService;
  @Inject() private readonly nodeService: NodeService;

  async onModuleInit() {
    const packageManifests = packages.map((pkg) => pkg.manifest);
    const dbPackages = await this.packageService.syncPackages(packageManifests);
    const dbNodeTypes = await this.nodeTypeService.syncNodeTypes(
      dbPackages,
      packageManifests.map((pkg) => pkg.nodeTypes).flat()
    );
    const dbConfigs = await this.configService.syncConfigs(
      dbPackages,
      packageManifests.map((pkg) => pkg.configs).flat()
    );
    await this.nodeService.syncNodes(
      dbPackages,
      dbNodeTypes,
      dbConfigs,
      packageManifests
    );
  }
}