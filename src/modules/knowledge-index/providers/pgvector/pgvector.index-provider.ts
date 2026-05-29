import { Client } from "pg";

import type { IndexProvider } from "../index-provider.interface";

import type { PgvectorIndexConfig } from "./pgvector.config";

export class PgvectorIndexProvider implements IndexProvider {
  name = "index-pgvector";
  constructor(private readonly config: PgvectorIndexConfig) {}

  async testConnection(): Promise<void> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      await client.connect();
      await client.query("SELECT 1");
    } finally {
      await client.end();
    }
  }
}
