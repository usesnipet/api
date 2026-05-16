/**
 * @file This file defines the root module of the NestJS application.
 */
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import { schemas } from "./db";
import { env } from "./env";
import { ConfigModule } from "./modules/config/config.module";
import { DatabaseModule } from "./modules/database/database.module";
import { FlowModule } from "./modules/flow/flow.module";
import { NodeTypeModule } from "./modules/node-type/node-type.module";
import { NodeModule } from "./modules/node/node.module";
import { PackageModule } from "./modules/package/package.module";
import { SyncModule } from "./modules/sync/sync.module";
import { TagModule } from "./modules/tag/tag.module";
import { AppController } from "./app.controller";

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule.register({
      pg: { connection: "pool", config: { connectionString: env.DATABASE_URL } },
      config: { schema: schemas },
    }),
    FlowModule,
    NodeModule,
    SyncModule,
    ConfigModule,
    NodeTypeModule,
    PackageModule,
    TagModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
