import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function isAuthenticated() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, secret);
}

export async function requireUser() {
  if (!(await isAuthenticated())) {
    throw new Error("Non autorisé");
  }
}
