"use client";

import Link from "next/link";
import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { completeRoutine } from "@/app/actions/routines";
import { completeTask, reopenTask, snoozeTask } from "@/app/actions/tasks";
import { ContextPicker, inContext, useStartContext } from "@/components/context-picker";
import { ParentDoneNotice } from "@/components/parent-done-notice";
import { ScreenHeader } from "@/components/screen-header";
import { SplitPane } from "@/components/split-pane";
import { SplitTask } from "@/components/split-task";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { isApartmentPaused, useTravelMode } from "@/components/travel-mode";
import { categoryClass } from "@/lib/categories";
import { gaugeClass, gaugeTextClass } from "@/lib/gauge";
import type { RoutineView } from "@/lib/data/routines";
import type { TaskView } from "@/lib/data/tasks";
import { cn } from "cn";

export function StartScreen({
  queue,
  routines,
}: {
  queue: TaskView[];
  routines: RoutineView[];
}) {
  const [skipped, setSkipped] = useState<string[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hiddenRoutineId, setHiddenRoutineId] = useState<string | null>(null);
  const [closedParent, setClosedParent] = useState<{ id: string; title: string } | null>(null);
  const [splitSignal, setSplitSignal] = useState(0);
  const [pending, startTransition] = useTransition();
  const [optimisticQueue, hideTask] = useOptimistic(queue, (current, id: string) =>
    current.filter((task) => task.id !== id),
  );

  const context = useStartContext();
  const traveling = useTravelMode();
  const scopedQueue = optimisticQueue.filter((task) => inContext(task.category, context));
  const remaining = scopedQueue.filter((task) => !skipped.includes(task.id));
  const current = remaining.find((task) => task.id === focusId) ?? remaining[0] ?? null;
  const routine =
    scopedQueue.some((task) => task.isMicro)
      ? null
      : (routines.find(
          (item) =>
            item.id !== hiddenRoutineId &&
            inContext(item.category, context) &&
            !isApartmentPaused(item.category, traveling),
        ) ?? null);
  const visibleRoutine = routine;
  const routineIsQuiet = current !== null;

  function skip() {
    if (!current || remaining.length < 2) return;
    setSkipped((ids) => [...ids, current.id]);
  }

  function completeCurrent() {
    if (!current || pending) return;
    const id = current.id;
    startTransition(async () => {
      hideTask(id);
      const closed = await completeTask(id);
      if (closed) setClosedParent(closed);
    });
  }

  function snoozeCurrent() {
    if (!current || pending) return;
    const id = current.id;
    startTransition(async () => {
      hideTask(id);
      await snoozeTask(id);
    });
  }

  function undoClosedParent() {
    if (!closedParent) return;
    const id = closedParent.id;
    setClosedParent(null);
    startTransition(async () => {
      await reopenTask(id);
    });
  }

  const actionsRef = useRef({
    completeCurrent,
    skip,
    canSplit: Boolean(current && !current.isMicro),
  });
  actionsRef.current = {
    completeCurrent,
    skip,
    canSplit: Boolean(current && !current.isMicro),
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (window.innerWidth < 1024) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.repeat) return;
      if (isTyping(event.target)) return;

      const key = event.key.toLowerCase();
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        actionsRef.current.completeCurrent();
        return;
      }
      if (event.key === "ArrowRight" || key === "s") {
        event.preventDefault();
        actionsRef.current.skip();
        return;
      }
      if (key === "d" && actionsRef.current.canSplit) {
        event.preventDefault();
        setSplitSignal((value) => value + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function finishRoutine() {
    if (!visibleRoutine) return;
    const id = visibleRoutine.id;
    startTransition(async () => {
      setHiddenRoutineId(id);
      await completeRoutine(id);
    });
  }

  const rows = (
    <ul className="mt-4">
      {remaining.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            onClick={() => setFocusId(task.id)}
            className={cn(
              "w-full rounded-xl px-3 py-3 text-left",
              current?.id === task.id ? "bg-card" : "",
            )}
          >
            <span className={cn("block text-[15px] leading-snug", categoryClass[task.category])}>
              {task.title}
            </span>
            <span className={cn("mt-0.5 block text-[13px]", categoryClass[task.category])}>
              {task.category}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  function frame(phone: ReactNode, detail: ReactNode) {
    return (
      <>
        <div className="lg:hidden">
          <ContextPicker />
          <ScreenHeader title="Par où je commence" hint="Une seule chose." />
          {phone}
        </div>
        <div className="hidden lg:block lg:h-full">
          <SplitPane
            list={
              <>
                <ContextPicker />
                <ScreenHeader title="Par où je commence" hint="Une seule chose." />
                {rows}
              </>
            }
            detail={detail}
          />
        </div>
        <ParentDoneNotice
          parent={closedParent}
          onUndo={undoClosedParent}
          onDismiss={() => setClosedParent(null)}
        />
      </>
    );
  }

  if (!current && scopedQueue.length === 0 && !visibleRoutine) {
    if (context !== "all") {
      const quiet = (
        <p className="px-1 pt-16 text-[15px] text-muted-foreground">Rien par ici.</p>
      );
      return frame(quiet, quiet);
    }
    const empty = (
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
    return frame(empty, empty);
  }

  if (!current && scopedQueue.length > 0) {
    const passed = (
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
    return frame(passed, passed);
  }

  const focus = (
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
            <p
              className={cn(
                "mt-5 text-[1.65rem] leading-[1.15] font-medium tracking-[-0.04em]",
                categoryClass[current.category],
              )}
            >
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
            {remaining.length === 1 && scopedQueue.length > 1 ? (
              <p className="mt-4 text-center text-[13px] text-muted-foreground">
                C&apos;est la seule qui reste.
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-center gap-6">
              {scopedQueue.length > 1 ? (
                <button
                  type="button"
                  onClick={skip}
                  className="h-11 text-[14px] text-muted-foreground"
                >
                  Pas celle-là
                </button>
              ) : (
                <p className="text-[13px] text-muted-foreground">C&apos;est la seule pour l&apos;instant.</p>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={snoozeCurrent}
                className="h-11 text-[14px] text-muted-foreground disabled:opacity-100"
              >
                Pas aujourd&apos;hui
              </button>
            </div>
            {current.isMicro ? null : (
              <div className="mt-6 border-t border-border pt-5">
                <SplitTask key={current.id} taskId={current.id} openSignal={splitSignal} />
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

  return frame(focus, focus);
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
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
