import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { RoutineScreen } from "@/components/routine-screen";
import { ScreenHeader } from "@/components/screen-header";
import { getRoutines } from "@/lib/queries";

export default function RoutinesPage() {
  return (
    <>
      <ScreenHeader title="Routines" hint="L'entretien, sans date limite." />
      <Suspense fallback={<ListSkeleton />}>
        <Routines />
      </Suspense>
    </>
  );
}

async function Routines() {
  const routines = await getRoutines();
  return <RoutineScreen routines={routines} />;
}
