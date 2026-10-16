import { Suspense } from "react";
import { connection } from "next/server";
import { ListSkeleton } from "@/components/list-skeleton";
import { TaskScreen } from "@/components/task-screen";
import { getActiveTasks } from "@/lib/data/tasks";

export default function QuickWinsPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <QuickWins />
    </Suspense>
  );
}

async function QuickWins() {
  await connection();
  const tasks = await getActiveTasks(true);
  return (
    <TaskScreen
      tasks={tasks}
      microMode="locked"
      heading="Quick wins"
      hint="Moins de cinq minutes."
      placeholder="Une petite tâche…"
      emptyTitle="Rien à vider."
      emptyBody="Les tâches de moins de 5 minutes arrivent ici."
    />
  );
}
