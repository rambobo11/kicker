import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { loginAttempts } from "@/db/schema";
import { getDb } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

async function hashKey(secret: string, ip: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${secret}:${ip}`),
  );
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function clientKey(secret: string) {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  return hashKey(secret, ip);
}

export async function loginIsAllowed(key: string) {
  const [row] = await getDb()
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.key, key))
    .limit(1);
  if (!row?.lockedUntil) return true;
  return row.lockedUntil.getTime() <= Date.now();
}

export async function recordLoginFailure(key: string) {
  const now = new Date();
  const db = getDb();
  const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
  const windowIsOpen = row && now.getTime() - row.windowStartedAt.getTime() <= WINDOW_MS;
  const failures = windowIsOpen ? row.failures + 1 : 1;
  const lockedUntil = failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MS) : null;
  const windowStartedAt = windowIsOpen ? row.windowStartedAt : now;

  await db
    .insert(loginAttempts)
    .values({ key, failures, windowStartedAt, lockedUntil })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: { failures, windowStartedAt, lockedUntil },
    });
}

export async function clearLoginFailures(key: string) {
  await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
}
