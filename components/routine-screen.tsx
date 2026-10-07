"use client";

import { Plus } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { addRoutine, completeRoutine } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  CATEGORIES,
  INTERVALS,
  categoryClass,
  type Category,
  type IntervalDays,
} from "@/lib/categories";
import { gaugeClass, gaugeTextClass } from "@/lib/gauge";
import type { RoutineView } from "@/lib/queries";
import { cn } from "cn";

export function RoutineScreen({ routines }: { routines: RoutineView[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Base Camp");
  const [intervalDays, setIntervalDays] = useState<IntervalDays>(7);
  const [pending, startTransition] = useTransition();
  const [optimisticRoutines, updateRoutines] = useOptimistic(
    routines,
    (
      current,
      action:
        | { type: "add"; routine: RoutineView }
        | { type: "complete"; id: string },
    ) => {
      if (action.type === "add") return [action.routine, ...current];
      return current
        .map((routine) =>
          routine.id === action.id
            ? {
                ...routine,
                tone: "fresh" as const,
                value: 100,
                elapsedLabel: "Faite aujourd'hui",
                statusLabel: "Large",
              }
            : routine,
        )
        .sort((left, right) => toneRank(left.tone) - toneRank(right.tone));
    },
  );

  function submit() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    const routine: RoutineView = {
      id: crypto.randomUUID(),
      title: nextTitle,
      category,
      intervalDays,
      intervalLabel: intervalDays === 1 ? "Tous les jours" : `Tous les ${intervalDays} jours`,
      tone: "overdue",
      value: 100,
      elapsedLabel: "Jamais faite",
      statusLabel: "À faire",
    };
    setTitle("");
    startTransition(async () => {
      updateRoutines({ type: "add", routine });
      await addRoutine({ title: nextTitle, category, intervalDays });
    });
  }

  function complete(id: string) {
    startTransition(async () => {
      updateRoutines({ type: "complete", id });
      await completeRoutine(id);
    });
  }

  return (
    <div>
      <form
        className="mb-8"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Une routine d'entretien…"
            aria-label="Nouvelle routine"
            maxLength={180}
            className="h-12 border-0 bg-transparent px-0 text-[17px] shadow-none focus-visible:ring-0 md:text-[17px] placeholder:text-[#b7b2aa]"
          />
          <button
            type="submit"
            disabled={pending || title.trim().length === 0}
            aria-label="Ajouter la routine"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background transition-colors disabled:bg-[#d9d4cc]"
          >
            <Plus className="size-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Catégorie">
          {CATEGORIES.map((item) => {
            const selected = item === category;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  selected ? "bg-foreground text-background" : "bg-white text-muted-foreground",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Intervalle">
          {INTERVALS.map((days) => {
            const selected = days === intervalDays;
            return (
              <button
                key={days}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setIntervalDays(days)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  selected ? "bg-foreground text-background" : "bg-white text-muted-foreground",
                )}
              >
                {days === 1 ? "1 j" : `${days} j`}
              </button>
            );
          })}
        </div>
      </form>

      {optimisticRoutines.length === 0 ? (
        <div className="px-1 pt-16">
          <p className="text-[1.35rem] font-medium tracking-[-0.03em]">Rien à entretenir.</p>
          <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
            Ajoute la vaisselle, le linge, les plantes. La jauge remplace la date limite.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {optimisticRoutines.map((routine) => (
            <li key={routine.id}>
              <Card className="rounded-3xl bg-white py-0 shadow-[0_10px_30px_rgba(40,32,20,0.04)] ring-0">
                <CardContent className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[17px] leading-snug font-medium tracking-[-0.02em]">
                        {routine.title}
                      </p>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {routine.elapsedLabel}
                        <span className="px-1.5 text-black/20">·</span>
                        {routine.intervalLabel}
                      </p>
                    </div>
                    <span className={cn("shrink-0 pt-1 text-[12px]", categoryClass[routine.category])}>
                      {routine.category}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn("text-[12px] font-medium", gaugeTextClass[routine.tone])}>
                        {routine.statusLabel}
                      </span>
                    </div>
                    <Progress value={routine.value} aria-label={routine.statusLabel}>
                      <ProgressTrack className="h-1.5 bg-[#eceae4]">
                        <ProgressIndicator className={gaugeClass[routine.tone]} />
                      </ProgressTrack>
                    </Progress>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => complete(routine.id)}
                    className="mt-4 h-11 rounded-full border-black/8 bg-transparent px-5"
                  >
                    C&apos;est fait
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toneRank(tone: RoutineView["tone"]) {
  if (tone === "overdue") return 0;
  if (tone === "soon") return 1;
  return 2;
}
