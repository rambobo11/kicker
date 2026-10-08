import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { tasks } from "@/db/schema";
import type { Category } from "@/lib/categories";
import { getDb } from "@/lib/db";

export type TaskView = {
  id: string;
  title: string;
  category: Category;
  isMicro: boolean;
  parentId: string | null;
};

export function toTaskView(task: {
  id: string;
  title: string;
  category: Category;
  isMicro: boolean;
  parentId: string | null;
}): TaskView {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    isMicro: task.isMicro,
    parentId: task.parentId,
  };
}

export async function getActiveTasks(microOnly: boolean): Promise<TaskView[]> {
  const rows = await getDb()
    .select()
    .from(tasks)
    .where(
      microOnly
        ? and(eq(tasks.isCompleted, false), eq(tasks.isMicro, true))
        : eq(tasks.isCompleted, false),
    )
    .orderBy(desc(tasks.createdAt));

  return rows.map(toTaskView);
}
