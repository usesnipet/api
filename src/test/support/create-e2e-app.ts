import { schemas } from "@/db";
import { DatabaseModule } from "@/modules/database/database.module";
import { OrganizationModule } from "@/modules/organization/organization.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

export async function buildE2EApp(connectionString: string): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      DatabaseModule.register({
        pg: { connection: "pool", config: { connectionString } },
        config: { schema: schemas },
      }),
      OrganizationModule,
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
