import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { tasks } from "@/db/schema";
import type { Category } from "@/lib/categories";
import { withDb } from "@/lib/db";

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

function remember(tag: "tasks" | "routines") {
  cacheTag(tag);
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
}

function asList<T>(value: T[] | string | null): T[] {
  if (!value) return [];
  return typeof value === "string" ? (JSON.parse(value) as T[]) : value;
}

export async function getActiveTasks(microOnly: boolean): Promise<TaskView[]> {
  "use cache";
  remember("tasks");

  const rows = await withDb((db) =>
    db
      .select()
      .from(tasks)
      .where(
        microOnly
          ? and(eq(tasks.isCompleted, false), eq(tasks.isMicro, true))
          : eq(tasks.isCompleted, false),
      )
      .orderBy(desc(tasks.createdAt)),
  );

  return rows.map(toTaskView);
}

export async function getBrainTasks(): Promise<{ tasks: TaskView[]; done: TaskView[] }> {
  "use cache";
  remember("tasks");

  const [row] = await withDb((db) =>
    db.execute<{
      active: TaskView[] | string | null;
      done: TaskView[] | string | null;
    }>(sql`
      select
        coalesce((
          select json_agg(json_build_object(
            'id', id,
            'title', title,
            'category', category,
            'isMicro', is_micro,
            'parentId', parent_id
          ) order by created_at desc)
          from tasks
          where is_completed = false
        ), '[]'::json) as active,
        coalesce((
          select json_agg(json_build_object(
            'id', id,
            'title', title,
            'category', category,
            'isMicro', is_micro,
            'parentId', parent_id
          ) order by created_at desc)
          from tasks
          where is_completed = true
        ), '[]'::json) as done
    `),
  );

  return {
    tasks: asList<TaskView>(row?.active).map(toTaskView),
    done: asList<TaskView>(row?.done).map(toTaskView),
  };
}
