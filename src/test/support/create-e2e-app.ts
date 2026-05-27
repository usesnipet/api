import { ProviderModule } from "@/common/provider/provider.module";
import { schemas } from "@/db";
import { ApiKeyModule } from "@/modules/api-key/api-key.module";
import { ConfigSchemaModule } from "@/modules/config-schema";
import { DatabaseModule } from "@/modules/database/database.module";
import { KnowledgeIndexModule } from "@/modules/knowledge-index/knowledge-index.module";
import { KnowledgeSourceModule } from "@/modules/knowledge-source/knowledge-source.module";
import { LlmConnectionModule } from "@/modules/llm-connection/llm-connection.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

export async function buildE2EApp(connectionString: string): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      DatabaseModule.register({
        pg: { connection: "pool", config: { connectionString } },
        config: { schema: schemas },
      }),
      ConfigSchemaModule,
      ApiKeyModule,
      KnowledgeIndexModule,
      KnowledgeSourceModule,
      LlmConnectionModule,
      ProviderModule.forRoot(),
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }),
  );
  await app.init();

  return app;
}
