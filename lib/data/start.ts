import "server-only";
import { sql } from "drizzle-orm";
import type { Category } from "@/lib/categories";
import { getDb } from "@/lib/db";
import type { RoutineView } from "@/lib/data/routines";
import { toTaskView, type TaskView } from "@/lib/data/tasks";
import { routineGauge, urgencyScore } from "@/lib/gauge";

type TaskRow = {
  id: string;
  title: string;
  category: Category;
  isMicro: boolean;
  parentId: string | null;
  createdAt: string;
};

type RoutineRow = {
  id: string;
  title: string;
  category: Category;
  intervalDays: number;
  lastCompletedAt: string | null;
};

function asList<T>(value: T[] | string | null): T[] {
  if (!value) return [];
  return typeof value === "string" ? (JSON.parse(value) as T[]) : value;
}

export async function getStartScreen(): Promise<{
  queue: TaskView[];
  routine: RoutineView | null;
}> {
  const [row] = await getDb().execute<{ tasks: TaskRow[] | string | null; routines: RoutineRow[] | string | null }>(sql`
    select
      coalesce((
        select json_agg(json_build_object(
          'id', id,
          'title', title,
          'category', category,
          'isMicro', is_micro,
          'parentId', parent_id,
          'createdAt', created_at
        ))
        from tasks
        where is_completed = false
      ), '[]'::json) as tasks,
      coalesce((
        select json_agg(json_build_object(
          'id', id,
          'title', title,
          'category', category,
          'intervalDays', interval_days,
          'lastCompletedAt', last_completed_at
        ))
        from routines
      ), '[]'::json) as routines
  `);

  const queue = asList<TaskRow>(row?.tasks)
    .sort((left, right) => {
      if (left.isMicro !== right.isMicro) return left.isMicro ? -1 : 1;
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    })
    .map((task) => toTaskView(task));

  if (queue.some((task) => task.isMicro)) {
    return { queue, routine: null };
  }

  const now = Date.now();
  const routineList = asList<RoutineRow>(row?.routines)
    .map((routine) => {
      const lastCompletedAt = routine.lastCompletedAt ? new Date(routine.lastCompletedAt) : null;
      const gauge = routineGauge(lastCompletedAt, routine.intervalDays, now);
      return {
        id: routine.id,
        title: routine.title,
        category: routine.category,
        intervalDays: routine.intervalDays,
        intervalLabel:
          routine.intervalDays === 1 ? "Tous les jours" : `Tous les ${routine.intervalDays} jours`,
        lastCompletedAt,
        ...gauge,
      };
    })
    .sort(
      (left, right) =>
        urgencyScore(right.lastCompletedAt, right.intervalDays, now) -
        urgencyScore(left.lastCompletedAt, left.intervalDays, now),
    );

  return {
    queue,
    routine: routineList.find((routine) => routine.tone === "overdue") ?? null,
  };
}
