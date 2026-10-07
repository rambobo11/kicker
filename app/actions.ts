"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { routines, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isCategory, isInterval } from "@/lib/categories";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  passwordsMatch,
} from "@/lib/session";

function refreshTasks() {
  revalidatePath("/");
  revalidatePath("/quick-wins");
}

function refreshRoutines() {
  revalidatePath("/routines");
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expected || !secret || !passwordsMatch(password, expected)) {
    redirect("/login?error=1");
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function addTask(input: {
  title: string;
  category: string;
  isMicro: boolean;
}) {
  await requireUser();
  const title = input.title.trim().slice(0, 180);
  if (!title || !isCategory(input.category)) return;

  await db.insert(tasks).values({
    title,
    category: input.category,
    isMicro: input.isMicro,
  });
  refreshTasks();
}

export async function completeTask(id: string) {
  await requireUser();
  if (!UUID.test(id)) return;
  await db.update(tasks).set({ isCompleted: true }).where(eq(tasks.id, id));
  refreshTasks();
}

export async function addRoutine(input: {
  title: string;
  category: string;
  intervalDays: number;
}) {
  await requireUser();
  const title = input.title.trim().slice(0, 180);
  if (!title || !isCategory(input.category) || !isInterval(input.intervalDays)) return;

  await db.insert(routines).values({
    title,
    category: input.category,
    intervalDays: input.intervalDays,
  });
  refreshRoutines();
}

export async function completeRoutine(id: string) {
  await requireUser();
  if (!UUID.test(id)) return;
  await db
    .update(routines)
    .set({ lastCompletedAt: new Date() })
    .where(eq(routines.id, id));
  refreshRoutines();
}
