export interface PgvectorIndexConfig extends Record<string, unknown> {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}
