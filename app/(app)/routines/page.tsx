import { Suspense } from "react";
import { connection } from "next/server";
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
  await connection();
  const routines = await getRoutines();
  return <RoutineScreen routines={routines} />;
}
