/**
 * @file This file defines the root module of the NestJS application.
 */
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { ProviderModule } from "./common/provider/provider.module";
import { schemas } from "./db";
import { env } from "./env";
import { ApiKeyModule } from "./modules/api-key/api-key.module";
import { ConfigSchemaModule } from "./modules/config-schema";
import { DatabaseModule } from "./modules/database/database.module";
import { KnowledgeIndexModule } from "./modules/knowledge-index/knowledge-index.module";
import { KnowledgeSourceModule } from "./modules/knowledge-source/knowledge-source.module";
import { LlmConnectionModule } from "./modules/llm-connection/llm-connection.module";

@Module({
  controllers: [AppController],
  imports: [
    ProviderModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigSchemaModule,
    ApiKeyModule,
    KnowledgeIndexModule,
    KnowledgeSourceModule,
    LlmConnectionModule,
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
