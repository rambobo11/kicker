import { Suspense } from "react";
import { ListSkeleton } from "@/components/list-skeleton";
import { ScreenHeader } from "@/components/screen-header";
import { StartScreen } from "@/components/start-screen";
import { getStartScreen } from "@/lib/data/start";

export default function StartPage() {
  return (
    <>
      <ScreenHeader title="Par où je commence" hint="Une seule chose." />
      <Suspense fallback={<ListSkeleton />}>
        <Start />
      </Suspense>
    </>
  );
}

async function Start() {
  const { queue, routine } = await getStartScreen();
  return <StartScreen queue={queue} routine={routine} />;
}
