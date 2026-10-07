import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { ScreenHeader } from "@/components/screen-header";
import { TaskScreen } from "@/components/task-screen";
import { getActiveTasks } from "@/lib/queries";

export default function BrainDumpPage() {
  return (
    <>
      <ScreenHeader title="Brain dump" hint="Ce qui traverse l'esprit." />
      <Suspense fallback={<ListSkeleton />}>
        <BrainDump />
      </Suspense>
    </>
  );
}

async function BrainDump() {
  const tasks = await getActiveTasks(false);
  return (
    <TaskScreen
      tasks={tasks}
      microMode="choice"
      placeholder="Une idée, une tâche…"
      emptyTitle="L'esprit est clair."
      emptyBody="La prochaine idée a un endroit où atterrir."
    />
  );
}
