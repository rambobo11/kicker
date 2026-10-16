import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { RoutineScreen } from "@/components/routine-screen";
import { getRoutines } from "@/lib/data/routines";

export default function RoutinesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Routines />
    </Suspense>
  );
}

async function Routines() {
  const routines = await getRoutines();
  return <RoutineScreen routines={routines} />;
}
