import { Suspense } from "react";
import { connection } from "next/server";
import { ListSkeleton } from "@/components/list-skeleton";
import { TaskScreen } from "@/components/task-screen";
import { getBrainTasks } from "@/lib/data/tasks";

export default function BrainDumpPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <BrainDump />
    </Suspense>
  );
}

async function BrainDump() {
  await connection();
  const { tasks, done } = await getBrainTasks();
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
