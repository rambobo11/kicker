import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { StartScreen } from "@/components/start-screen";
import { getStartScreen } from "@/lib/data/start";

export default function StartPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Start />
    </Suspense>
  );
}

async function Start() {
  const { queue, routines } = await getStartScreen();
  return <StartScreen queue={queue} routines={routines} />;
}
