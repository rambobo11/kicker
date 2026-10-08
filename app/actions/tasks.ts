"use server";

import { eq } from "drizzle-orm";
import { tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth/guard";
import { isCategory } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { revalidateTasks } from "@/lib/revalidate";
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
  if (!UUID.test(id)) return;
  await getDb().update(tasks).set({ isCompleted: true }).where(eq(tasks.id, id));
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
