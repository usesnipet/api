import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgClient, NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";
import type { schemas } from "./schema";
import { Pool } from "pg";

export type Database = NodePgDatabase<typeof schemas> & {
  $client: NodePgClient extends typeof schemas ? Pool : typeof schemas;
};

export type DatabaseTransaction = NodePgTransaction<
  typeof schemas,
  ExtractTablesWithRelations<typeof schemas>
>;

/** Root client or an open transaction — same query API for services. */
export type DatabaseSession = Database | DatabaseTransaction;

