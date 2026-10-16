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
    connect_timeout: 5,
    idle_timeout: 20,
    max_lifetime: 60 * 10,
    keep_alive: 15,
    fetch_types: false,
  });
}

function resetDb() {
  const client = globalForDb.client;
  globalForDb.client = undefined;
  globalForDb.db = undefined;
  if (client) void client.end({ timeout: 1 }).catch(() => undefined);
}

function isTransient(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return (
    code === "QUERY_TIMEOUT" ||
    code === "CONNECT_TIMEOUT" ||
    code === "CONNECTION_CLOSED" ||
    code === "CONNECTION_ENDED" ||
    code === "CONNECTION_DESTROYED" ||
    code === "ECONNRESET" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "EAI_AGAIN" ||
    code === "57P01" ||
    code === "08000" ||
    code === "08003" ||
    code === "08006" ||
    code === "08001"
  );
}

function withTimeout<T>(promise: Promise<T>, milliseconds = 4000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error("La base n'a pas répondu"), { code: "QUERY_TIMEOUT" }));
    }, milliseconds);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function withDb<T>(run: (db: Database) => Promise<T>): Promise<T> {
  try {
    return await withTimeout(run(getDb()));
  } catch (error) {
    if (!isTransient(error)) throw error;
    resetDb();
    return await withTimeout(run(getDb()));
  }
}

export function getDb() {
  if (!globalForDb.db) {
    const client = globalForDb.client ?? createClient();
    globalForDb.client = client;
    globalForDb.db = drizzle(client, { schema });
  }
  return globalForDb.db;
}
