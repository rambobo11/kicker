"use server";

import { eq } from "drizzle-orm";
import { routines } from "@/db/schema";
import { requireUser } from "@/lib/auth/guard";
import { isCategory, isInterval } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { revalidateRoutines } from "@/lib/revalidate";
import { UUID, cleanTitle } from "@/lib/validation";

export async function addRoutine(input: {
  title: string;
  category: string;
  intervalDays: number;
}) {
  await requireUser();
  const title = cleanTitle(input.title);
  if (!title || !isCategory(input.category) || !isInterval(input.intervalDays)) return;

  await getDb().insert(routines).values({
    title,
    category: input.category,
    intervalDays: input.intervalDays,
  });
  revalidateRoutines();
}

export async function completeRoutine(id: string) {
  await requireUser();
  if (!UUID.test(id)) return;
  await getDb()
    .update(routines)
    .set({ lastCompletedAt: new Date() })
    .where(eq(routines.id, id));
  revalidateRoutines();
}
