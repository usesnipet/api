import { Controller, Get } from "@nestjs/common";
import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { readFileSync } from "node:fs";
import { join } from "node:path";

class SystemInfo {
  @ApiProperty()
  version!: string;
}

@Controller()
export class AppController {
  @Get("system")
  @ApiResponse({
    status: 200,
    description: "Get system information",
    type: SystemInfo,
  })
  getSystemInfo(): SystemInfo {
    try {
      const pkgPath = join(process.cwd(), "package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
      return { version: pkg.version ?? "unknown" };
    } catch {
      return { version: "unknown" };
    }
  }
}
