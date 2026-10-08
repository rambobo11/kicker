"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { completeRoutine } from "@/app/actions/routines";
import { completeTask } from "@/app/actions/tasks";
import { SplitTask } from "@/components/split-task";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { categoryClass } from "@/lib/categories";
import { gaugeClass, gaugeTextClass } from "@/lib/gauge";
import type { RoutineView } from "@/lib/data/routines";
import type { TaskView } from "@/lib/data/tasks";
import { cn } from "cn";

export function StartScreen({
  queue,
  routine,
}: {
  queue: TaskView[];
  routine: RoutineView | null;
}) {
  const [skipped, setSkipped] = useState<string[]>([]);
  const [hiddenRoutineId, setHiddenRoutineId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimisticQueue, hideTask] = useOptimistic(queue, (current, id: string) =>
    current.filter((task) => task.id !== id),
  );

  const remaining = optimisticQueue.filter((task) => !skipped.includes(task.id));
  const current = remaining[0] ?? null;
  const visibleRoutine = routine && routine.id !== hiddenRoutineId ? routine : null;
  const routineIsQuiet = current !== null;

  function skip() {
    if (!current || remaining.length < 2) return;
    setSkipped((ids) => [...ids, current.id]);
  }

  function completeCurrent() {
    if (!current) return;
    const id = current.id;
    startTransition(async () => {
      hideTask(id);
      await completeTask(id);
    });
  }

  function finishRoutine() {
    if (!visibleRoutine) return;
    const id = visibleRoutine.id;
    startTransition(async () => {
      setHiddenRoutineId(id);
      await completeRoutine(id);
    });
  }

  if (!current && optimisticQueue.length === 0 && !visibleRoutine) {
    return (
      <div className="px-1 pt-16">
        <p className="text-[1.35rem] font-medium tracking-[-0.03em]">Rien en attente.</p>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
          Pose une idée dans le brain dump. Cet écran choisit par où commencer.
        </p>
        <Link
          href="/brain"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-[14px] text-background"
        >
          Ouvrir le brain dump
        </Link>
      </div>
    );
  }

  if (!current && optimisticQueue.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="px-1 pt-10">
          <p className="text-[1.35rem] font-medium tracking-[-0.03em]">Tu les as toutes passées.</p>
          <button
            type="button"
            onClick={() => setSkipped([])}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-[14px] text-background"
          >
            Reprendre la première
          </button>
        </div>
        {visibleRoutine ? (
          <RoutineCard
            routine={visibleRoutine}
            quiet
            pending={pending}
            onComplete={finishRoutine}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {current ? (
        <Card className="rounded-[1.75rem] bg-card py-0 shadow-[0_10px_30px_rgba(40,32,20,0.04)] ring-0 dark:shadow-none">
          <CardContent className="px-6 py-7">
            <div className="flex items-center justify-between gap-3">
              <span className={cn("text-[12px]", categoryClass[current.category])}>
                {current.category}
              </span>
              {current.isMicro ? (
                <span className="text-[12px] text-muted-foreground">5 min</span>
              ) : null}
            </div>
            <p className="mt-5 text-[1.65rem] leading-[1.15] font-medium tracking-[-0.04em]">
              {current.title}
            </p>
            <Button
              type="button"
              disabled={pending}
              onClick={completeCurrent}
              className="mt-8 h-12 w-full rounded-full text-[15px]"
            >
              C&apos;est fait
            </Button>
            {remaining.length === 1 && optimisticQueue.length > 1 ? (
              <p className="mt-4 text-center text-[13px] text-muted-foreground">
                C&apos;est la seule qui reste.
              </p>
            ) : null}
            {optimisticQueue.length > 1 ? (
              <button
                type="button"
                onClick={skip}
                className="mt-3 h-11 w-full text-[14px] text-muted-foreground"
              >
                Pas celle-là
              </button>
            ) : (
              <p className="mt-4 text-center text-[13px] text-muted-foreground">
                C&apos;est la seule pour l&apos;instant.
              </p>
            )}
            {current.isMicro ? null : (
              <div className="mt-6 border-t border-border pt-5">
                <SplitTask key={current.id} taskId={current.id} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {visibleRoutine ? (
        <RoutineCard
          routine={visibleRoutine}
          quiet={routineIsQuiet}
          pending={pending}
          onComplete={finishRoutine}
        />
      ) : null}
    </div>
  );
}

function RoutineCard({
  routine,
  quiet,
  pending,
  onComplete,
}: {
  routine: RoutineView;
  quiet: boolean;
  pending: boolean;
  onComplete: () => void;
}) {
  return (
    <Card
      className={cn(
        "rounded-3xl bg-card py-0 ring-0",
        quiet
          ? "shadow-none"
          : "shadow-[0_10px_30px_rgba(40,32,20,0.04)]",
      )}
    >
      <CardContent className={quiet ? "px-5 py-4" : "px-6 py-7"}>
        {quiet ? (
          <p className="mb-2 text-[12px] text-muted-foreground">Et aussi</p>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                "leading-snug font-medium tracking-[-0.02em]",
                quiet ? "text-[15px]" : "text-[1.65rem] leading-[1.15] tracking-[-0.04em]",
              )}
            >
              {routine.title}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">{routine.elapsedLabel}</p>
          </div>
          <span className={cn("shrink-0 pt-1 text-[12px]", categoryClass[routine.category])}>
            {routine.category}
          </span>
        </div>
        <div className="mt-4">
          <span className={cn("text-[12px] font-medium", gaugeTextClass[routine.tone])}>
            {routine.statusLabel}
          </span>
          <Progress value={routine.value} aria-label={routine.statusLabel} className="mt-2">
            <ProgressTrack className="h-1.5 bg-muted">
              <ProgressIndicator className={gaugeClass[routine.tone]} />
            </ProgressTrack>
          </Progress>
        </div>
        <Button
          type="button"
          variant={quiet ? "outline" : "default"}
          disabled={pending}
          onClick={onComplete}
          className={cn(
            "mt-4 rounded-full",
            quiet ? "h-10 border-border bg-transparent px-5" : "h-12 w-full text-[15px]",
          )}
        >
          C&apos;est fait
        </Button>
      </CardContent>
    </Card>
  );
}
