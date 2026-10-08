import "server-only";
import { routines } from "@/db/schema";
import type { Category } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { routineGauge, urgencyScore } from "@/lib/gauge";

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

export async function getRoutines(): Promise<RoutineView[]> {
  const rows = await getDb().select().from(routines);
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
