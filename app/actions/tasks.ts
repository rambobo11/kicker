"use server";

import { and, eq } from "drizzle-orm";
import { tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth/guard";
import { isCategory } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { revalidateTasks } from "@/lib/revalidate";
import { tomorrowAtFour } from "@/lib/snooze";
import { UUID, cleanTitle } from "@/lib/validation";

export async function addTask(input: {
  title: string;
  category: string;
  isMicro: boolean;
}) {
  await requireUser();
  const title = cleanTitle(input.title);
  if (!title || !isCategory(input.category)) return;

  await getDb().insert(tasks).values({
    title,
    category: input.category,
    isMicro: input.isMicro,
  });
  revalidateTasks();
}

export async function completeTask(id: string) {
  await requireUser();
  if (!UUID.test(id)) return null;

  const closedParent = await getDb().transaction(async (tx) => {
    const [task] = await tx.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!task || task.isCompleted) return null;

    await tx.update(tasks).set({ isCompleted: true }).where(eq(tasks.id, id));
    if (!task.parentId) return null;

    const [stillOpen] = await tx
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.parentId, task.parentId), eq(tasks.isCompleted, false)))
      .limit(1);
    if (stillOpen) return null;

    const [parent] = await tx.select().from(tasks).where(eq(tasks.id, task.parentId)).limit(1);
    if (!parent || parent.isCompleted) return null;

    await tx.update(tasks).set({ isCompleted: true }).where(eq(tasks.id, parent.id));
    return { id: parent.id, title: parent.title };
  });

  revalidateTasks();
  return closedParent;
}

export async function snoozeTask(id: string) {
  await requireUser();
  if (!UUID.test(id)) return;
  await getDb().update(tasks).set({ snoozedUntil: tomorrowAtFour() }).where(eq(tasks.id, id));
  revalidateTasks();
}

export async function updateTask(input: { id: string; title: string; category: string }) {
  await requireUser();
  const title = cleanTitle(input.title);
  if (!UUID.test(input.id) || !title || !isCategory(input.category)) return;
  await getDb().update(tasks).set({ title, category: input.category }).where(eq(tasks.id, input.id));
  revalidateTasks();
}

export async function reopenTask(id: string) {
  await requireUser();
  if (!UUID.test(id)) return;
  await getDb().update(tasks).set({ isCompleted: false }).where(eq(tasks.id, id));
  revalidateTasks();
}

export async function splitTask(input: { parentId: string; titles: string[] }) {
  await requireUser();
  if (!UUID.test(input.parentId)) return;

  const titles = input.titles
    .map((title) => cleanTitle(title))
    .filter((title): title is string => title !== null)
    .slice(0, 3);
  if (titles.length < 2) return;

  const db = getDb();
  const [parent] = await db.select().from(tasks).where(eq(tasks.id, input.parentId)).limit(1);
  if (!parent || parent.isCompleted || parent.isMicro) return;

  const base = Date.now();
  await db.insert(tasks).values(
    titles.map((title, index) => ({
      title,
      category: parent.category,
      isMicro: true,
      parentId: parent.id,
      createdAt: new Date(base + index * 1000),
    })),
  );
  revalidateTasks();
}
