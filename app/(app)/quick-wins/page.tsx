import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { ScreenHeader } from "@/components/screen-header";
import { TaskScreen } from "@/components/task-screen";
import { getActiveTasks } from "@/lib/queries";

export default function QuickWinsPage() {
  return (
    <>
      <ScreenHeader title="Quick wins" hint="Moins de cinq minutes." />
      <Suspense fallback={<ListSkeleton />}>
        <QuickWins />
      </Suspense>
    </>
  );
}

async function QuickWins() {
  const tasks = await getActiveTasks(true);
  return (
    <TaskScreen
      tasks={tasks}
      microMode="locked"
      placeholder="Une petite tâche…"
      emptyTitle="Rien à vider."
      emptyBody="Les tâches de moins de 5 minutes arrivent ici."
    />
  );
}
