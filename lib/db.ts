import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL est absent de .env.local");
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

const client = globalForDb.client ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
