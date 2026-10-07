import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED ou DIRECT_URL est absent de .env.local. Utilise l'URI Supabase en session pooler (port 5432).",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});
