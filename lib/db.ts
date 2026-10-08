import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: Database;
};

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL est absent");
  }
  const parsed = new URL(url);
  parsed.searchParams.delete("pgbouncer");
  return parsed.toString();
}

function createClient() {
  return postgres(connectionString(), {
    prepare: false,
    max: 1,
    ssl: "require",
  });
}

export function getDb() {
  if (!globalForDb.db) {
    const client = globalForDb.client ?? createClient();
    globalForDb.client = client;
    globalForDb.db = drizzle(client, { schema });
  }
  return globalForDb.db;
}
