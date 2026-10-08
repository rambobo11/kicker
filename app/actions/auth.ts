"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginFailures,
  clientKey,
  loginIsAllowed,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import {
  SESSION_COOKIE,
  createSessionToken,
  passwordsMatch,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expected || !secret) redirect("/login?error=1");

  const key = await clientKey(secret);
  if (!(await loginIsAllowed(key))) redirect("/login?error=2");

  if (!passwordsMatch(password, expected)) {
    await recordLoginFailure(key);
    redirect("/login?error=1");
  }

  await clearLoginFailures(key);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(secret), sessionCookieOptions());
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  redirect("/login");
}
