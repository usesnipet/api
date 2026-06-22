/**
 * @file This file defines the root module of the NestJS application.
 */
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { schemas } from "./db";
import { env } from "./env";
import { AuthGuard } from "./modules/auth/auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { ApiKeyModule } from "./modules/api-key/api-key.module";
import { DatabaseModule } from "./modules/database/database.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  controllers: [AppController],
  imports: [
    JwtModule.register({
      global: true,
    }),
    ScheduleModule.forRoot(),
    OrganizationModule,
    ApiKeyModule,
    AuthModule,
    UserModule,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
