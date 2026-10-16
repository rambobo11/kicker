import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { TaskScreen } from "@/components/task-screen";
import { getActiveTasks, getCompletedTasks } from "@/lib/data/tasks";

export default function BrainDumpPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <BrainDump />
    </Suspense>
  );
}

async function BrainDump() {
  const [tasks, done] = await Promise.all([getActiveTasks(false), getCompletedTasks()]);
  return (
    <TaskScreen
      tasks={tasks}
      done={done}
      microMode="choice"
      allowSplit
      heading="Brain dump"
      hint="Ce qui traverse l'esprit."
      placeholder="Une idée, une tâche…"
      emptyTitle="L'esprit est clair."
      emptyBody="La prochaine idée a un endroit où atterrir."
    />
  );
}
