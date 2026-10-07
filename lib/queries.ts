import { and, desc, eq } from "drizzle-orm";
import { routines, tasks } from "@/db/schema";
import { db } from "@/lib/db";
import type { Category } from "@/lib/categories";
import { routineGauge, urgencyScore } from "@/lib/gauge";

export type TaskView = {
  id: string;
  title: string;
  category: Category;
  isMicro: boolean;
};

export type RoutineView = {
  id: string;
  title: string;
  category: Category;
  intervalDays: number;
  intervalLabel: string;
  tone: "fresh" | "soon" | "overdue";
  value: number;
  elapsedLabel: string;
  statusLabel: string;
};

function intervalLabel(intervalDays: number) {
  return intervalDays === 1 ? "Tous les jours" : `Tous les ${intervalDays} jours`;
}

export async function getActiveTasks(microOnly: boolean): Promise<TaskView[]> {
  const rows = await db
    .select()
    .from(tasks)
    .where(
      microOnly
        ? and(eq(tasks.isCompleted, false), eq(tasks.isMicro, true))
        : eq(tasks.isCompleted, false),
    )
    .orderBy(desc(tasks.createdAt));

  return rows.map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    isMicro: task.isMicro,
  }));
}

export async function getRoutines(): Promise<RoutineView[]> {
  const rows = await db.select().from(routines);
  const now = Date.now();

  return rows
    .slice()
    .sort(
      (left, right) =>
        urgencyScore(right.lastCompletedAt, right.intervalDays, now) -
        urgencyScore(left.lastCompletedAt, left.intervalDays, now),
    )
    .map((routine) => {
      const gauge = routineGauge(routine.lastCompletedAt, routine.intervalDays, now);
      return {
        id: routine.id,
        title: routine.title,
        category: routine.category,
        intervalDays: routine.intervalDays,
        intervalLabel: intervalLabel(routine.intervalDays),
        ...gauge,
      };
    });
}
