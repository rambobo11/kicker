import "server-only";
import { eq } from "drizzle-orm";
import { tasks } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getRoutines, type RoutineView } from "@/lib/data/routines";
import { toTaskView, type TaskView } from "@/lib/data/tasks";

export async function getStartScreen(): Promise<{
  queue: TaskView[];
  routine: RoutineView | null;
}> {
  const rows = await getDb().select().from(tasks).where(eq(tasks.isCompleted, false));
  const queue = rows
    .slice()
    .sort((left, right) => {
      if (left.isMicro !== right.isMicro) return left.isMicro ? -1 : 1;
      return left.createdAt.getTime() - right.createdAt.getTime();
    })
    .map(toTaskView);

  if (queue.some((task) => task.isMicro)) {
    return { queue, routine: null };
  }

  const routineList = await getRoutines();
  return {
    queue,
    routine: routineList.find((routine) => routine.tone === "overdue") ?? null,
  };
}
