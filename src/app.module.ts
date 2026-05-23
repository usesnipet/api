/**
 * @file This file defines the root module of the NestJS application.
 */
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { schemas } from "./db";
import { env } from "./env";
import { ApiKeyModule } from "./modules/api-key/api-key.module";
import { DatabaseModule } from "./modules/database/database.module";

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    ApiKeyModule,
    DatabaseModule.register({
      pg: { connection: "pool", config: { connectionString: env.DATABASE_URL } },
      config: { schema: schemas },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
